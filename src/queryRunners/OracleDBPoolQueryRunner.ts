import type { DatabaseType, QueryRunner } from "./QueryRunner"
import type { Pool, Connection } from 'oracledb'
import { BIND_OUT } from 'oracledb'
import { OracleDBQueryRunner } from "./OracleDBQueryRunner"
import { AbstractPoolQueryRunner } from "./AbstractPoolQueryRunner"

export class OracleDBPoolQueryRunner extends AbstractPoolQueryRunner {
    readonly database: DatabaseType
    readonly pool: Pool

    constructor(pool: Pool) {
        super()
        this.pool = pool
        this.database = 'oracle'
    }

    useDatabase(database: DatabaseType): void {
        if (database !== 'oracle') {
            throw new Error('Unsupported database: ' + database + '. OracleDBPoolQueryRunner only supports oracle databases')
        }
    }
    getNativeRunner(): unknown {
        return this.pool
    }
    addParam(params: any[], value: any): string {
        const index = params.length
        params.push(value)
        return ':' + index
    }
    addOutParam(params: any[], name: string): string {
        const index = params.length
        if (name) {
            params.push({dir: BIND_OUT, as: name})
        } else {
            params.push({dir: BIND_OUT})
        }
        return ':' + index
    }
    createResolvedPromise<RESULT>(result: RESULT): Promise<RESULT> {
        return Promise.resolve(result) 
    }
    protected createQueryRunner(): Promise<QueryRunner> {
        return this.pool.getConnection().then(connection => new OracleDBQueryRunner(connection))
    }
    protected releaseQueryRunner(queryRunner: QueryRunner): void {
        (queryRunner.getNativeRunner() as Connection).close()
    }

}