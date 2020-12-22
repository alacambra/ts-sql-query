//import { NoopConnection } from "./clients/NoopConnection"
import { Table } from "./Table"
import { PostgreSqlConnection } from "./connections/PostgreSqlConnection"
import { ConsoleLogNoopQueryRunner } from "./queryRunners/ConsoleLogNoopQueryRunner"
import { View } from "./View"
import { ConsoleLogQueryRunner } from "./queryRunners/ConsoleLogQueryRunner"
import { NoopQueryRunner } from "./queryRunners/NoopQueryRunner"
import { TypeSafeMySqlConnection } from "./connections/TypeSafeMySqlConnection"
import { MockQueryRunner } from "./queryRunners/MockQueryRunner"
// import { TypeSafeNoopConnection } from "./clients/TypeSafeNoopConnection"
// import { int } from "ts-extended-types"

class MyConection extends PostgreSqlConnection<'MyConnection'> {
    procedure1(p1: number) {
        return this.executeProcedure('procedure1', [this.const(p1, 'int')])
    }
    function1(p1: number) {
        return this.executeFunction('function1', [this.const(p1, 'int')], 'int', 'required')
    }
    now = this.buildFragmentWithArgs().as(() => {
        return this.fragmentWithType('localDateTime', 'required').sql`now()`
    })

    isBigFactorial = this.buildFragmentWithArgs(
        this.arg('int', 'required'),
        this.arg('int', 'required')
    ).as((a1, a2) => {
        return this.fragmentWithType('boolean', 'required').sql`!!${a1} > ${a2}`
    })
}

class MyTable extends Table<MyConection, 'MyTable'> {
    id = this.autogeneratedPrimaryKeyBySequence('id', 'mySeq', 'int')
    c = this.column('c', 'int')
    d = this.column('d', 'string')
    e = this.columnWithDefaultValue('e', 'localDateTime')
    oc = this.optionalColumn('oc', 'int')
    od = this.optionalColumn('od', 'string')
    oe = this.optionalColumn('oe', 'localDateTime')
    bool = this.optionalColumn('bool', 'boolean')
    constructor() {
        super('t')
    }
}

// declare var a: ColumnsOf<MyConection, MyTable>
// declare var aa: keyof MyTable

// declare var ate: TypeOfColumn<MyConection, MyTable, 'oe'>

let t = new MyTable()

// class MyConection2 extends NoopConnection<MyConection2, 'MyConection2'> {
// }
let q = new class MyTable2 extends Table<MyConection, 'MyTable2'> {
    f = this.column('f', 'int')
    g = this.optionalColumn('g', 'string')
    constructor() {
        super('q')
    }
}()
let cn = new MyConection(new ConsoleLogNoopQueryRunner())
cn.const(10, 'int')
let query = cn.insertInto(t)
    .set({ c: 10, d: '', oc: 20 }).setIfValue({ c: null, e: cn.default() })
    // .set(t.c).value(10)
    // .set(t.c).value(12)
    .ignoreIfSet('e').returningLastInsertedId()
console.log(query.query(), query.params())

// query = cn.insertInto(t).dynamicSet().set({ c: 10 }).set({d: ''})
// console.log(query.query(), query.params())

// query = cn.insertInto(q).defaultValues()
// console.log(query.query(), query.params())

let query1 = cn.updateAllowingNoWhere(t)
    .set({c: t.c, d: 'hola', e: new Date()})
    .set({ c: 11 })
    .set({ e: cn.default() })
    .ignoreIfSet('e')
    // .set(t.c).value(10)
    // .set(t.c).value(11)
console.log(query1.query(), query1.params())

//let m = t.c.power(10)
// let mm = t.c.power(cn.pi())
// let mm1 = t.c.power(mm)
// let mm2 = t.c.power(q.c)
// let mm3 = cn.pi().power(cn.pi()).equals(3)
// let mm4 = cn.const(3).power(10).smallAs(mm1)

// let cond = mm1.largeAs(7).negate()

const di: any = {}
let where
where = cn.true()
if (di.a) {
    where = where.and(t.c.smallAs(10))
}
if (!di.b) {
    where = where.and(t.c.smaller(1))
}
where = where.and(t.c.equals(2))

let query2 = cn.update(t)
    .set({ c: t.c })
    .where(where)
//    .where(t.c.larger(10).and(t.c.larger(1)))
    // .where(cn.pi().power(t.c).equals(3).and(t.c.larger(10)))
//     .whereAnd(
//     cn.pi().power(t.c).equals(3),
//     t.c.largeAs(10)
// )

//    .set(t.c).value(t.c).where(cn.pi().power(t.c).equals(3))
console.log(query2.query(), query2.params())

q.f.abs()

let query3 = cn.update(t)
    .set({ d: 'hello' })
    .dynamicWhere()

query3 = query3.and(t.c.largeAs(10))
query3 = query3.and(t.d.equals('mm'))

console.log(query3.query(), query3.params())

let query4 = cn.deleteFrom(t)
    .dynamicWhere()

query4 = query4.and(t.c.largeAs(33))
query4 = query4.and(t.d.equals('zz'))

console.log(query4.query(), query4.params())

// import { Table, Column } from "./query"
// import { PostgreSqlConnection } from "./client/postgreSql/postgreSql"

// let t = new Table(undefined, 't')
// let c = new Column<number>('c')
// let cn = new PostgreSqlConnection()
// cn.insertInto(t)
//     .set(c).value(10)
//     .set(c).value(12)
//     .onConflictOnConstraint('f').doNothing().returningAll().execute()


let query5 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).select({
    d: t.d,
    od: t.od,
    e: t.e,
    bool: cn.true().equals(t.bool.equals(t.bool)),
    isBigFactorial: cn.isBigFactorial(t.c, 100),
    now: cn.now()
}).orderByFromString('d, od desc, e asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query5.query(), query5.params())

let query6 = cn.selectDistinctFrom(t).where(t.c.is(10)).and(t.od.isNot('d')).select({
    d: t.d,
    od: t.od
})

//let r6 = query6.executeSelectOne()
console.log(query6.query(), query6.params())

let q2 = q.as('a')
let query7 = cn.selectFrom(t).from(q2).where(t.c.equals(q2.f)).select({
    d: t.d,
    f: q2.f
})

//let r7 = query7.executeSelectOne()
console.log(query7.query(), query7.params())

let query8 = cn.selectFromNoTable().select({
    date: cn.currentDate()
})

//let r8 = query8.executeSelectOne()
console.log(query8.query(), query8.params())

let query9 = cn.selectFrom(t).join(q).on(t.c.equals(q.f)).where(t.c.equals(10)).and(t.od.notEquals('d')).select({
    d: t.d,
    od: t.od,
    f: q.f
})

//let r9 = query9.executeSelectOne()
console.log(query9.query(), query9.params())


let query10 = cn.selectFrom(t)
    .innerJoin(q).dynamicOn().and(t.c.equals(q.f)).and(t.c.largeAs(12))
    .where(t.c.equals(10)).and(t.od.notEquals('d'))
    .select({
        d: t.d,
        od: t.od,
        f: q.f
    })

//let r10 = query10.executeSelectOne()
console.log(query10.query(), query10.params())

var ot = t.forUseInLeftJoinAs('jo')
let query11 = cn.selectFrom(q)
    .leftOuterJoin(ot).on(ot.c.equals(q.f))
    .innerJoin(q).on(ot.c.equals(q.f))
    .where(ot.c.equals(10)).and(ot.od.notEquals('d'))
    .select({
        d: ot.d,
        od: ot.od,
        f: q.f
    }).limit(10)

//let r11 = query11.executeSelectOne()
console.log(query11.query(), query11.params())

let subquery12 = cn.selectFrom(q).where(q.f.equals(1)).select({f: q.f})
let query12 = cn.selectDistinctFrom(t).where(t.c.equals(10)).and(cn.exists(subquery12)).select({
    d: t.d,
    od: t.od
})

//let r12 = query12.executeSelectOne()
console.log(query12.query(), query12.params())

let subquery13 = cn.subSelectUsing(t).from(q).where(q.f.equals(t.c)).select({f: q.f})
let query13 = cn.selectDistinctFrom(t).where(t.c.equals(10)).and(cn.notExists(subquery13)).select({
    d: t.d,
    od: t.od
})

//let r13 = query13.executeSelectOne()
console.log(query13.query(), query13.params())

let subquery14 = cn.selectFrom(q).where(q.f.equals(1)).selectOneColumn(q.f)
let query14 = cn.selectDistinctFrom(t).where(t.c.equals(10)).and(t.c.in(subquery14)).select({
    d: t.d,
    od: t.od
})

//let r14 = query14.executeSelectOne()
console.log(query14.query(), query14.params())

let subquery15 = cn.subSelectUsing(t).from(q).where(q.f.equals(t.c)).selectOneColumn(q.f)
let query15 = cn.selectDistinctFrom(t).where(t.c.equals(10)).and(t.c.notIn(subquery15)).select({
    d: t.d,
    od: t.od
})

//let r15 = query15.executeSelectOne()
console.log(query15.query(), query15.params())

cn.procedure1(16)
cn.function1(17).catch(_ => undefined) // ignore error

//cn.fragment`${t.c} <|> ${cn.const(7, 'int')}`.withType('boolean', 'required')
let query16 = cn.selectFrom(t).where(t.c.equals(9)).and(cn.fragmentWithType('boolean', 'required').sql`${t.c} <|> ${cn.const(7, 'int')}`).select({
    d: cn.fragmentWithType('int', 'required').sql`max2(${t.d})`,
    od: t.od
})

//let r16 = query16.executeSelectOne()
console.log(query16.query(), query16.params())

let query17 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).select({
    cd: t.d,
    cod: t.od,
    ce: t.e,
    cbool: cn.true().equals(t.bool.equals(t.bool))
}).groupBy('cd', 'cod').groupBy('ce').orderByFromString('cd, cod desc, ce asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query17.query(), query17.params())

let query18 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).select({
    cd: t.d,
    cod: t.od,
    ce: t.e,
    cbool: cn.true().equals(t.bool.equals(t.bool))
}).groupBy(t.d, t.od).groupBy(t.e).orderByFromString('cd, cod desc, ce asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query18.query(), query18.params())

let query19 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).select({
    cd: t.d,
    cod: t.od,
    ce: t.e,
    cbool: cn.true().equals(t.bool.equals(t.bool))
}).groupBy('cd', 'cod').groupBy('ce').having(t.d.equals('a')).and(t.od.isNotNull()).orderByFromString('cd, cod desc, ce asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query19.query(), query19.params())

let query20 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).select({
    cd: t.d,
    cod: t.od,
    ce: t.e,
    cbool: cn.true().equals(t.bool.equals(t.bool))
}).groupBy(t.d, t.od).groupBy(t.e).dynamicHaving().and(t.d.equals('a')).or(t.od.isNotNull()).orderByFromString('cd, cod desc, ce asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query20.query(), query20.params())

let query21 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).groupBy(t.d, t.od).groupBy(t.e).select({
    cd: t.d,
    cod: t.od,
    ce: t.e,
    cbool: cn.true().equals(t.bool.equals(t.bool))
}).orderByFromString('cd, cod desc, ce asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query21.query(), query21.params())

let query22 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).groupBy(t.d, t.od).groupBy(t.e).dynamicHaving().and(t.d.equals('a')).or(t.od.isNotNull()).select({
    cd: t.d,
    cod: t.od,
    ce: t.e,
    cbool: cn.true().equals(t.bool.equals(t.bool))
}).orderByFromString('cd, cod desc, ce asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query22.query(), query22.params())

let query23 = cn.selectFrom(t).where(t.c.equals(10)).and(t.bool).groupBy(t.od, t.e).select({
    count: cn.stringConcat(t.d),
    cod: t.od,
    ce: t.e
}).orderByFromString('count, cod desc, ce asc').limit(5).offset(4)

//let r5 = query5.executeSelectOne()
console.log(query23.query(), query23.params())

cn.rollback()

/********************************************************************************************** */

class AConection extends TypeSafeMySqlConnection<'adb'> { }

const tPerson = new class TPerson extends Table<AConection, 'TPerson'> {
    public id = this.autogeneratedPrimaryKey("id", "int");
    public email = this.column("email", "string");
    public name = this.column("name", "string");
    public tfn = this.column("tfn", "string");
    public countryId = this.column("countryId", "int"); // FK

    constructor() {
        super("person"); // table name in the database
    }
}()

const tUser = new class TUser extends Table<AConection, 'TUser'> {
    public id = this.autogeneratedPrimaryKey("id", "int");
    public personId = this.column("personId", "int");
    public passwdId = this.column("passwdId", "int");
    public dateRegister = this.column("dateRegister", "localDateTime");
    public acceptGdpr = this.column("acceptGdpr", "boolean");
    public enabled = this.column("enabled", "boolean");
    public signInType = this.column("signInType", "int");

    constructor() {
        super("user"); // table name in the database
    }
}()

const tPasswd = new class TPasswd extends Table<AConection, 'TPasswd'> {
    public id = this.autogeneratedPrimaryKey("id", "int");
    public passwd = this.column("passwd", "string");
    public dateInit = this.column("dateInit", "localDateTime");
    public dateEnd = this.column("dateEnd", "localDateTime");

    constructor() {
        super("passwd"); // table name in the database
    }
}()

const cnn = new AConection(new ConsoleLogQueryRunner(new NoopQueryRunner()))

const username = 'un'

const passwords = tPasswd.as("passwords")
const persons = tPerson.as("persons")

const queryHandle = cnn
  .selectFrom(tUser)
  .join(persons).on(tUser.personId.equals(persons.id))
  .join(passwords).on(tUser.passwdId.equals(passwords.id))
  .where(persons.name.equals(username))
  .and(tUser.acceptGdpr)
  .and(tUser.enabled)
  .selectOneColumn(passwords.passwd)

const querya = queryHandle.query()
const parmsa = queryHandle.params()

console.log(querya, parmsa);

/********************************************************************************************** */

class DBConection extends PostgreSqlConnection<'DBConnection'> { 

    bitwiseShiftLeft = this.buildFragmentWithArgs(
        this.arg('int', 'required'),
        this.arg('int', 'required')
    ).as((left, right) => {
        // The fragment here is: ${left} << ${right}
        // Could be another fragment like a function call: myFunction(${left}, ${right})
        return this.fragmentWithType('int', 'required').sql`${left} << ${right}`
    })
}

const tCompany = new class TCompany extends Table<DBConection, 'TCompany'> {
    id = this.autogeneratedPrimaryKey('id', 'int')
    name = this.column('name', 'string')
    constructor() {
        super('company'); // table name in the database
    }
}()

const tCustomer = new class TCustomer extends Table<DBConection, 'TCustomer'> {
    id = this.autogeneratedPrimaryKey('id', 'int')
    firstName = this.column('first_name', 'string')
    lastName = this.column('last_name', 'string')
    birthday = this.optionalColumn('birthday', 'localDate')
    companyId = this.column('company_id', 'int')
    constructor() {
        super('customer'); // table name in the database
    }
}()

const vCustomerAndCompany = new class VCustomerAndCompany extends View<DBConection, 'VCustomerAndCompany'> {
    companyId = this.column('company_id', 'int')
    companyName = this.column('company_name', 'string')
    customerId = this.column('customer_id', 'int')
    customerFirstName = this.column('customer_first_name', 'string')
    customerLastName = this.column('customer_last_name', 'string')
    customerBirthday = this.optionalColumn('customer_birthday', 'localDate')
    constructor() {
        super('customer_company')
    }
}()

const results: any[] = []
const postResults: any[] = []
const mockQueryRunner = new MockQueryRunner(
    (_type, _query, _params, index) => {
        return results[index]
    }
)

const connection = new DBConection(/*postgre pg connection*/ new ConsoleLogQueryRunner(mockQueryRunner))

results.push({
    id: 1,
    firstName: 'First Name',
    lastName: 'Last Name'
})

const customerId = 10

const customersWithId = connection.selectFrom(tCustomer)
    .where(tCustomer.id.equals(customerId))
    .select({
        id: tCustomer.id,
        firstName: tCustomer.firstName,
        lastName: tCustomer.lastName,
        birthday: tCustomer.birthday
    })
    .executeSelectOne()

// Query: select id as id, first_name as firstName, last_name as lastName, birthday as birthday from customer where id = $1
// Params: [ 10 ]

results.push([])

const firstName = 'John'
const lastName = ''

const company = tCompany.as('comp')
const customersWithCompanyName = connection.selectFrom(tCustomer)
    .innerJoin(company).on(tCustomer.companyId.equals(company.id))
    .where(tCustomer.firstName.startWithInsensitive(firstName))
        .and(tCustomer.lastName.startWithInsensitiveIfValue(lastName))
    .select({
        id: tCustomer.id,
        firstName: tCustomer.firstName,
        lastName: tCustomer.lastName,
        birthday: tCustomer.birthday,
        companyName: company.name
    })
    .orderBy('firstName')
    .orderBy('lastName', 'asc')
    .executeSelectMany()

// Query: select customer.id as id, customer.first_name as firstName, customer.last_name as lastName, customer.birthday as birthday, comp.name as companyName from customer inner join company as comp on customer.company_id = comp.id where customer.first_name ilike ($1 || '%') order by firstName, lastName asc
// Params: [ 'John' ]

results.push([])

const orderBy = 'customerFirstName asc nulls first, customerLastName'
const customerWithSelectedCompanies = connection.selectFrom(tCustomer)
    .where(tCustomer.companyId.in(
        connection.selectFrom(tCompany)
            .where(tCompany.name.contains('Cia.'))
            .selectOneColumn(tCompany.id)
    )).select({
        customerId: tCustomer.id,
        customerFirstName: tCustomer.firstName,
        customerLastName: tCustomer.lastName
    }).orderByFromString(orderBy)
    .executeSelectMany()

// Query: select id as customerId, first_name as customerFirstName, last_name as customerLastName from customer where company_id in (select id as result from company where name like ('%' || $1 || '%')) order by customerFirstName asc nulls first, customerLastName
// Params: [ 'Cia.' ]

results.push([])

const customerCountPerCompany = connection.selectFrom(tCompany)
    .innerJoin(tCustomer).on(tCustomer.companyId.equals(tCompany.id))
    .select({
        companyId: tCompany.id,
        companyName: tCompany.name,
        customerCount: connection.count(tCustomer.id)
    }).groupBy('companyId', 'companyName')
    .executeSelectMany()

// Query: select company.id as companyId, company.name as companyName, count(customer.id) as customerCount from company inner join customer on customer.company_id = company.id group by company.id, company.name
// Params: []

results.push([])

const customerCountPerCompany2 = connection.selectFrom(tCompany)
    .innerJoin(tCustomer).on(tCustomer.companyId.equals(tCompany.id))
    .groupBy(tCompany.id, tCompany.name)
    .select({
        companyId: tCompany.id,
        companyName: tCompany.name,
        customerCount: connection.count(tCustomer.id)
    })
    .executeSelectMany()

// Query: select company.id as companyId, company.name as companyName, count(customer.id) as customerCount from company inner join customer on customer.company_id = company.id group by company.id, company.name
// Params: []

results.push([])
postResults.push(0)

const customerName = 'Smi'
const customerPageWithName = connection.selectFrom(tCustomer)
    .where(
        tCustomer.firstName.startWithInsensitive(customerName)
    ).or(
        tCustomer.lastName.startWithInsensitive(customerName)
    ).select({
        id: tCustomer.id,
        firstName: tCustomer.firstName,
        lastName: tCustomer.lastName
    })
    .orderBy('firstName')
    .orderBy('lastName')
    .limit(10)
    .offset(20)
    .executeSelectPage()

// Query: select id as id, first_name as firstName, last_name as lastName from customer where first_name ilike ($1 || '%') or last_name ilike ($2 || '%') order by firstName, lastName limit $3 offset $4
// Params: [ 'Smi', 'Smi', 10, 20 ]

// Query: select count(*) from customer where first_name ilike ($1 || '%') or last_name ilike ($2 || '%')
// Params: [ 'Smi', 'Smi' ]

results.push(null)

const id = 10
const customersUsingCustomFragment = connection.selectFrom(tCustomer)
    .where(connection.fragmentWithType('boolean', 'required').sql`!!${tCustomer.id} = !!${connection.const(id, 'int')}`)
    .select({
        idAsString: connection.fragmentWithType('string', 'required').sql`${tCustomer.id}::varchar`,
        name: tCustomer.firstName.concat(' ').concat(tCustomer.lastName)
    })
    .executeSelectNoneOrOne()

// Query: select id::varchar as idAsString, first_name || $1 || last_name as name from customer where !!id = !!$2
// Params: [ ' ', 10 ]

results.push([])

const bitwiseMovements = 1
const multiplier = 2
const companiesUsingCustomFunctionFragment = connection.selectFrom(tCompany)
    .where(tCompany.id.multiply(multiplier).equals(connection.bitwiseShiftLeft(tCompany.id, bitwiseMovements)))
    .select({
        id: tCompany.id,
        name: tCompany.name,
        idMultiplyBy2: connection.bitwiseShiftLeft(tCompany.id, bitwiseMovements)
    })
    .executeSelectMany()

// Query: select id as id, name as name, id << $1 as idMultiplyBy2 from company where (id * $2) = (id << $3)
// Params: [ 1, 2, 1 ]

results.push(1)

const insertCustomer = connection.insertInto(tCustomer).set({
        firstName: 'John',
        lastName: 'Smith',
        companyId: 1
    }).setIfNotSet({
        birthday: new Date()
    }).returningLastInsertedId()
    .executeInsert()

// Query: insert into customer (first_name, last_name, company_id, birthday) values ($1, $2, $3, $4) returning id
// Params: [ 'John', 'Smith', 1, 2019-08-16T15:02:32.849Z ]

results.push([2, 3])

const valuesToInsert = [
    {
        firstName: 'John',
        lastName: 'Smith',
        companyId: 1
    },
    {
        firstName: 'Other',
        lastName: 'Person',
        companyId: 1
    }
]

const insertMultipleCustomers = connection.insertInto(tCustomer)
    .values(valuesToInsert)
    .returningLastInsertedId()
    .executeInsert();

// Query: insert into customer (first_name, last_name, company_id) values ($1, $2, $3), ($4, $5, $6) returning id
// Params: [ 'John', 'Smith', 1, 'Other', 'Person', 1 ]

results.push(1)

const insertCustomersFromSelect = connection.insertInto(tCustomer)
    .from(
        connection.selectFrom(tCustomer)
        .where(
            tCustomer.companyId.equals(1)
        )
        .select({
            firstName: tCustomer.firstName,
            lastName: tCustomer.lastName,
            companyId: tCustomer.companyId
        })
    )
    .executeInsert();

// Query: insert into customer (first_name, last_name, company_id) select first_name as firstName, last_name as lastName, company_id as companyId from customer where company_id = $1 
// Params: [ 1 ]

results.push(1)

const updateCustomer = connection.update(tCustomer).set({
        firstName: 'John',
        lastName: 'Smith',
        birthday: new Date()
    }).ignoreIfSet('birthday')
    .where(tCustomer.id.equals(10))
    .executeUpdate()

// Query: update customer set first_name = $1, last_name = $2 where id = $3
// Params: [ 'John', 'Smith', 10 ]

results.push(1)

const deleteCustomer = connection.deleteFrom(tCustomer)
    .where(tCustomer.id.equals(10))
    .executeDelete()

// Query: delete from customer where id = $1
// Params: [ 10 ]

results.push(...postResults)

vCustomerAndCompany.as('foo')
customersWithCompanyName.finally(() => undefined)
customerWithSelectedCompanies.finally(() => undefined)
customerCountPerCompany.finally(() => undefined)
customerCountPerCompany2.finally(() => undefined)
insertCustomer.finally(() => undefined)
insertMultipleCustomers.finally(() => undefined)
insertCustomersFromSelect.finally(() => undefined)
updateCustomer.finally(() => undefined)
deleteCustomer.finally(() => undefined)
customersUsingCustomFragment.finally(() => undefined)
companiesUsingCustomFunctionFragment.finally(() => undefined)
customerPageWithName.finally(() => undefined)
customersWithId.finally(() => undefined)

// case when then end
// agragate functions, group by, having
// begin transaction, commit, rollback
// return last inserted id
// with, with recursive
// from select
// window, over
// insert multiple
// union, intersect
// call stored procedure

// functions: coalesce, ifnull, min, max, nullIf <-- implentadas como valueWhenNull, minValue, maxValue, excepto nullIf
// maths: acosh-, asinh-, atanh-, difference(descartar), degrees-, radians-, cosh-, sinh-, tanh-, coth-,
// string: repeat(replicate) [no oracle], indexof(strpos, charindex) [difiere el resultado cuando no lo encuentra],
//         left(leftstr) [no disponible en oracle, usar substring], right(rightstr) [no disponible en oracle, usar substring]
//         lpad(padl) [no disponible en sql server], rpad(padr) [no disponible en sql server], padc?-,

// order by null first, last


/*
            returning   lastInsertedId  sequence
MariaDB     no          yes             no
MySql       no          yes             no
Oracle      yes*        no              yes
Postgre     yes         no              yes
Sqlite      no          yes             no
Sqlserver   yes         no              yes

   * It doen't work when you insert multiple rows
*/

/*
Things that I want to implement:
+ return last inserted id
+ begin transaction, commit, rollback
+ call stored procedure
+ sequences
+ order by null first, last: https://stackoverflow.com/questions/12503120/how-to-do-nulls-last-in-sqlite https://nickstips.wordpress.com/2010/09/30/sql-order-by-with-null-values-last/
+ sql fragments

2nd to implement:
+ basic agragate functions
+ group by
+ having

3rd to implement:
+ insert multiple
+ insert from select

4th to implement:
- with
- with recursive
- from select
- union, intersect
- returning

Things that I don't want to implement by now
- agregate functions: filter
- agregate functions: order by
- window, over
- complex agragate functions
*/