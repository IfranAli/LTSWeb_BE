import {db} from "../index";

export abstract class CrudService<T> {
    tableName: string = '';
    sqlSelectFrom = 'select * from ';
    sqlWhere = ' where ';
    sqlFind = this.sqlWhere + 'ID=(?)';
    sqlFindMany = this.sqlWhere + 'ID IN (?)';

    protected constructor(table: string) {
        this.tableName = table;
        this.sqlSelectFrom += this.tableName;
    }

    private static async makeRequest(query: string, params: any[] = []) {
        let connection;

        try {
            connection = await db.pool.getConnection();
            return connection.query(query, params);
        } catch (err: any) {
            console.log(err.message)
            throw err;
        } finally {
            if (connection) {
                connection.end();
            }
        }
    }

    public findAll = async (): (Promise<T[]>) => {
        return CrudService.makeRequest(this.sqlSelectFrom);
    }

    public find = async (id: number): (Promise<T>) => {
        let x = CrudService.makeRequest(this.sqlSelectFrom + this.sqlFind, [id]);
        return x;
        // return CrudService.makeRequest(this.sqlSelectFrom + this.sqlFind, [id]);
    }

    public findMany = async (ids: number[]): (Promise<T>) => {
        return CrudService.makeRequest(this.sqlSelectFrom + this.sqlFindMany, [ids]);
    }
}
