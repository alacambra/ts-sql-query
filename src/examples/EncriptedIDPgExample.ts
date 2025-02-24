/*
 * npm install pg
 * docker run --name ts-sql-query-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
 */

import { Pool } from 'pg'
import { PgPoolQueryRunner } from "../queryRunners/PgPoolQueryRunner";
import { PostgreSqlConnection } from "../connections/PostgreSqlConnection";
import { Table } from "../Table";
import { assertEquals } from "./assertEquals";
import { ConsoleLogQueryRunner } from "../queryRunners/ConsoleLogQueryRunner";
import { IDEncrypter } from '../extras/IDEncrypter';

class DBConection extends PostgreSqlConnection<'DBConnection'> {
    increment(i: number) {
        return this.executeFunction('increment', [this.const(i, 'int')], 'int', 'required')
    }
    appendToAllCompaniesName(aditional: string) {
        return this.executeProcedure('append_to_all_companies_name', [this.const(aditional, 'string')])
    }
    customerSeq = this.sequence<string>('customer_seq', 'customComparable', 'encryptedID')

    // PasswordEncrypter requires two strings of 16 chars of [A-Za-z0-9] working as passwords for the encrypt process
    private encrypter = new IDEncrypter('3zTvzr3p67VC61jm', '60iP0h6vJoEaJo8c')
    protected transformValueFromDB(value: unknown, type: string): unknown {
        if (type === 'encryptedID') {
            const id = super.transformValueFromDB(value, 'bigint')
            if (typeof id === 'bigint') {
                return this.encrypter.encrypt(id)
            } else {
                // return the value as is, it could be null
                return id
            }
        }
        return super.transformValueFromDB(value, type)
    }
    protected transformValueToDB(value: unknown, type: string): unknown {
        if (type === 'encryptedID') {
            if (value === null || value === undefined) {
                // In case of null or undefined send null to the database
                return null
            } else if (typeof value === 'string') {
                const id = this.encrypter.decrypt(value)
                return super.transformValueToDB(id, 'bigint')
            } else {
                throw new Error('Invalid id: ' + value)
            }
        }
        return super.transformValueToDB(value, type)
    }
}

const tCompany = new class TCompany extends Table<DBConection, 'TCompany'> {
    id = this.autogeneratedPrimaryKey<string>('id', 'customComparable', 'encryptedID');
    name = this.column('name', 'string');
    // This column allows access to the id without encrypt it
    rawID = this.computedColumn('id', 'int');
    constructor() {
        super('company'); // table name in the database
    }
}()

const tCustomer = new class TCustomer extends Table<DBConection, 'TCustomer'> {
    id = this.autogeneratedPrimaryKeyBySequence<string>('id', 'customer_seq', 'customComparable', 'encryptedID');
    firstName = this.column('first_name', 'string');
    lastName = this.column('last_name', 'string');
    birthday = this.optionalColumn('birthday', 'localDate');
    companyId = this.column<string>('company_id', 'customComparable', 'encryptedID');
    constructor() {
        super('customer'); // table name in the database
    }
}()


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
})

async function main() {
    const connection = new DBConection(new ConsoleLogQueryRunner(new PgPoolQueryRunner(pool)))
    await connection.beginTransaction()

    let commit = false
    try {
        await connection.queryRunner.executeDatabaseSchemaModification(`
            drop table if exists customer;
            drop table if exists company;
            drop sequence if exists customer_seq;
            drop function if exists increment;
            drop procedure if exists append_to_all_companies_name;

            create table company (
                id serial primary key,
                name varchar(100) not null
            );

            create table customer (
                id integer primary key,
                first_name varchar(100) not null,
                last_name varchar(100) not null,
                birthday date,
                company_id integer not null references company(id)
            );

            create sequence customer_seq;

            create function increment(i integer) returns integer AS $$
                begin
                    return i + 1;
                end;
            $$ language plpgsql;

            create procedure append_to_all_companies_name(aditional varchar) as $$
                update company set name = name || aditional;
            $$ language sql;
        `)

        let i = await connection
            .insertInto(tCompany)
            .values({ name: 'ACME' })
            .returningLastInsertedId()
            .executeInsert()
        assertEquals(i, 'uftSdCUhUTBQ0111')

        let n = await connection
            .insertInto(tCompany)
            .values({ name: 'FOO' })
            .executeInsert()
        assertEquals(n, 1)

        let ii = await connection
            .insertInto(tCustomer)
            .values([
                { firstName: 'John', lastName: 'Smith', companyId: 'uftSdCUhUTBQ0111' },
                { firstName: 'Other', lastName: 'Person', companyId: 'uftSdCUhUTBQ0111' },
                { firstName: 'Jane', lastName: 'Doe', companyId: 'uftSdCUhUTBQ0111' }
            ])
            .returningLastInsertedId()
            .executeInsert()
        assertEquals(ii, ['uftSdCUhUTBQ0111', 'dmY1mZ8zdxsw0210', 'RYG2E7kLCEQh030b'])

        i = await connection
            .selectFromNoTable()
            .selectOneColumn(connection.customerSeq.currentValue())
            .executeSelectOne()
        assertEquals(i, 'RYG2E7kLCEQh030b')

        let company = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals('uftSdCUhUTBQ0111'))
            .select({
                id: tCompany.id,
                name: tCompany.name
            })
            .executeSelectOne()
        assertEquals(company, { id: 'uftSdCUhUTBQ0111', name: 'ACME' })

        let companies = await connection
            .selectFrom(tCompany)
            .select({
                id: tCompany.id,
                name: tCompany.name,
                rawID: tCompany.rawID
            })
            .orderBy('id')
            .executeSelectMany()
        assertEquals(companies, [{ id: 'uftSdCUhUTBQ0111', name: 'ACME', rawID: 1 }, { id: 'dmY1mZ8zdxsw0210', name: 'FOO', rawID: 2 }])

        let name = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals('uftSdCUhUTBQ0111'))
            .selectOneColumn(tCompany.name)
            .executeSelectOne()
        assertEquals(name, 'ACME')

        let names = await connection
            .selectFrom(tCompany)
            .selectOneColumn(tCompany.name)
            .orderBy('result')
            .executeSelectMany()
        assertEquals(names, ['ACME', 'FOO'])

        n = await connection
            .insertInto(tCompany)
            .from(
                connection
                .selectFrom(tCompany)
                .select({
                    name: tCompany.name.concat(' 2')
                })
            )
            .executeInsert()
        assertEquals(n, 2)

        names = await connection
            .selectFrom(tCompany)
            .selectOneColumn(tCompany.name)
            .orderBy('result')
            .executeSelectMany()
        assertEquals(names, ['ACME', 'ACME 2', 'FOO', 'FOO 2'])

        n = await connection
            .update(tCompany)
            .set({
                name: tCompany.name.concat(tCompany.name)
            })
            .where(tCompany.id.equals('dmY1mZ8zdxsw0210'))
            .executeUpdate()
        assertEquals(n, 1)

        name = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals('dmY1mZ8zdxsw0210'))
            .selectOneColumn(tCompany.name)
            .executeSelectOne()
        assertEquals(name, 'FOOFOO')

        n = await connection
            .deleteFrom(tCompany)
            .where(tCompany.id.equals('dmY1mZ8zdxsw0210'))
            .executeDelete()
        assertEquals(n, 1)

        let maybe = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals('dmY1mZ8zdxsw0210'))
            .selectOneColumn(tCompany.name)
            .executeSelectNoneOrOne()
        assertEquals(maybe, null)

        let page = await connection
            .selectFrom(tCustomer)
            .select({
                id: tCustomer.id,
                name: tCustomer.firstName.concat(' ').concat(tCustomer.lastName)
            })
            .orderBy('id')
            .limit(2)
            .executeSelectPage()
        assertEquals(page, {
            count: 3,
            data: [
                { id: 'uftSdCUhUTBQ0111', name: 'John Smith' },
                { id: 'dmY1mZ8zdxsw0210', name: 'Other Person' }
            ]
        })

        const customerCountPerCompanyWith = connection.selectFrom(tCompany)
            .innerJoin(tCustomer).on(tCustomer.companyId.equals(tCompany.id))
            .select({
                companyId: tCompany.id,
                companyName: tCompany.name,
                endsWithME: tCompany.name.endWithInsensitive('me'),
                customerCount: connection.count(tCustomer.id)
            }).groupBy('companyId', 'companyName', 'endsWithME')
            .forUseInQueryAs('customerCountPerCompany')

        const customerCountPerAcmeCompanies = await connection.selectFrom(customerCountPerCompanyWith)
            .where(customerCountPerCompanyWith.companyName.containsInsensitive('ACME'))
            .select({
                acmeCompanyId: customerCountPerCompanyWith.companyId,
                acmeCompanyName: customerCountPerCompanyWith.companyName,
                acmeEndsWithME: customerCountPerCompanyWith.endsWithME,
                acmeCustomerCount: customerCountPerCompanyWith.customerCount
            })
            .executeSelectMany()
        assertEquals(customerCountPerAcmeCompanies, [
            { acmeCompanyId: 'uftSdCUhUTBQ0111', acmeCompanyName: 'ACME', acmeEndsWithME: true, acmeCustomerCount: 3 }
        ])

        n = await connection.increment(10)
        assertEquals(n, 11)

        await connection.appendToAllCompaniesName(' Cia.')

        name = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals('uftSdCUhUTBQ0111'))
            .selectOneColumn(tCompany.name)
            .executeSelectOne()
        assertEquals(name, 'ACME Cia.')

        commit = true
    } finally {
        if (commit) {
            connection.commit()
        } else {
            connection.rollback()
        }
    }
}

main().then(() => {
    console.log('All ok')
    process.exit(0)
}).catch((e) => {
    console.error(e)
    process.exit(1)
})

