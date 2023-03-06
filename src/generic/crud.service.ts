import {Pool, SqlError} from "mariadb";

export type KeyedObject<T> = { [index: string]: T };

interface TableUpdateData<T> {
    columns: (keyof T)[],
    values: string[]
}

export interface OkPacket {
    affectedRows: number,
    insertId: bigint,
    warningStatus: boolean,
}

export interface IResult<T> {
    data: T[],
    errors: string[]
}

type ErrorResponse = { errorMessage: string };

export abstract class CrudService<ModelType> {
    // todo: refactor this mess -- unreadable
    static sqlSelect = 'SELECT';
    static sqlDelete = 'DELETE';
    static sqlFrom = 'FROM';
    static sqlWhere = 'WHERE';
    static sqlValues = 'VALUES';
    static sqlUpdate = 'UPDATE';
    static sqlInsertInto = 'INSERT INTO';
    static sqlLimitOne = 'LIMIT 1';
    static sqlVar = '?'
    static sqlQuerySeparator = ', '
    tableName: string = '';
    sqlSelectFrom = CrudService.sqlSelect + ' * ' + CrudService.sqlFrom;
    sqlFind = CrudService.sqlWhere + ' ID=(?)';
    sqlFindMany = CrudService.sqlWhere + ' ID IN (?)';

    protected safeFields: Array<keyof ModelType>;
    protected readonly dbPool: Pool;

    protected constructor(pool: Pool, table: string, fields: Array<keyof ModelType>) {
        this.dbPool = pool;
        this.safeFields = fields;
        this.tableName = table;
        this.sqlSelectFrom += (' ' + this.tableName);
    }

    protected static sqlErrorToErrorMessage = (error: SqlError): ErrorResponse => {
        return {errorMessage: error.text ?? error.message}
    }

    protected static async makeRequest(pool: Pool, query: string, params: any[] = []) {
        let connection;

        try {
            connection = await pool.getConnection();
            return connection.query(query, params);
        } catch (err: any) {
            return err.message;
        } finally {
            if (connection) {
                connection.end();
            }
        }
    }

    public findAll = async (): (Promise<ModelType[]>) => {
        return CrudService.makeRequest(this.dbPool, this.sqlSelectFrom);
    }

    public find = async (id: number): (Promise<ModelType[]>) => {
        // todo: implement param checks.
        if (isNaN(id)) {
            throw new Error('Id is required.').message
        }

        const query = `${this.sqlSelectFrom} ${this.sqlFind} ${CrudService.sqlLimitOne}`;
        return CrudService.makeRequest(this.dbPool, query, [id]);
    }

    public delete = async (id: number): (Promise<any>) => {
        const query = `${CrudService.sqlDelete} ${CrudService.sqlFrom} ${this.tableName} ${this.sqlFind}`;
        return CrudService.makeRequest(this.dbPool, query, [id]);
    }

    public findMany = async (ids: number[]): (Promise<ModelType[]>) => {
        const query = `${this.sqlSelectFrom} ${this.sqlFindMany}`;
        return CrudService.makeRequest(this.dbPool, query, [ids]);
    }

    public runQuery = async (sql: string, values: Array<any> = []) => {
        return await CrudService.makeRequest(this.dbPool, sql, values)
            .then(value => value)
            .catch(reason => reason)
    }

    public updateMany = async (modelData: KeyedObject<ModelType>[]): Promise<IResult<ModelType>> => {
        const results = await Promise.all(modelData.map(data => this.update(data)).map(p => p.catch(e => e)));

        const data = results.filter(result => !(result instanceof SqlError));
        return {
            data: data.flatMap(a => a),
            errors: results.filter(result => (result instanceof SqlError))
        }
    }

    public createMany = async (modelData: KeyedObject<ModelType>[]): Promise<IResult<ModelType>> => {
        const results = await Promise.all(modelData.map(data => this.create(data)).map(p => p.catch(e => e)));

        const data = results.filter(result => !(result instanceof SqlError));
        return {
            data: data.flatMap(a => a),
            errors: results.filter(result => (result instanceof SqlError))
        }
    }

    public create = async (modelData: KeyedObject<ModelType>): Promise<ModelType[]> => {
        const updateFields = this.getUpdateFields(modelData);
        const nValues = updateFields.columns.length;
        const columns = updateFields.columns.join((CrudService.sqlQuerySeparator));
        const values = new Array(nValues).fill(CrudService.sqlVar).join(CrudService.sqlQuerySeparator);
        const sql = `${CrudService.sqlInsertInto} ${this.tableName} (${columns}) ${CrudService.sqlValues} (${values})`;

        return await CrudService.makeRequest(this.dbPool, sql, updateFields.values)
            .then((value: OkPacket) => {
                return this.find(Number(value.insertId)).then(inserted => inserted);
            })
            .catch((reason: SqlError) => Promise.reject(CrudService.sqlErrorToErrorMessage(reason)));
    }

    public update = async (modelData: KeyedObject<ModelType>) => {
        const updateFields = this.getUpdateFields(modelData);
        const nValues = updateFields.columns.length;
        if (nValues == 0) {
            return this.find(Number(modelData.id)).then(model => model);
        }

        const setVars = updateFields.columns.join('=?, ') + '=?'
        let sql = 'UPDATE ' + this.tableName + ' SET ' + setVars + ' WHERE ' + this.tableName + '.id=' + modelData.id;

        return await CrudService.makeRequest(this.dbPool, sql, updateFields.values)
            .then((value: OkPacket) => {
                return this.find(Number(modelData.id)).then(model => model);
            })
            .catch((reason: SqlError) => {
                Promise.reject(CrudService.sqlErrorToErrorMessage(reason))
            });
    }

    private getUpdateFields = (modelData: KeyedObject<ModelType>) => {
        let tableUpdateData: TableUpdateData<ModelType> = {
            values: [],
            columns: [],
        };

        return (Object.keys(modelData) as Array<keyof ModelType>)
            .filter((field: keyof ModelType) => this.safeFields.includes(field))
            .map((field: keyof ModelType) => [field as string, modelData[field as string] as string])
            .reduce<TableUpdateData<ModelType>>((previousValue: TableUpdateData<ModelType>, currentValue: string[]) => ({
                columns: [...previousValue.columns, currentValue[0] as keyof ModelType],
                values: [...previousValue.values, currentValue[1] as string],
            }), tableUpdateData);
    }
}
