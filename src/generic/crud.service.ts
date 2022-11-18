import {db} from "../index";

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

export abstract class CrudService<ModelType> {
    static sqlSelect = 'SELECT';
    static sqlFrom = 'FROM';
    static sqlWhere = 'WHERE';
    static sqlValues = 'VALUES';
    static sqlInsertInto = 'INSERT INTO';
    static sqlVar = '?'
    static sqlQuerySeparator = ', '
    tableName: string = '';
    sqlSelectFrom = CrudService.sqlSelect + ' * ' + CrudService.sqlFrom;
    sqlFind = CrudService.sqlWhere + ' ID=(?)';
    sqlFindMany = CrudService.sqlWhere + ' ID IN (?)';

    protected safeFields: Array<keyof ModelType>;

    protected constructor(table: string, fields: Array<keyof ModelType>) {
        this.safeFields = fields;
        this.tableName = table;
        this.sqlSelectFrom += (' ' + this.tableName);
    }

    private static async makeRequest(query: string, params: any[] = []) {
        let connection;

        try {
            connection = await db.pool.getConnection();
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
        return CrudService.makeRequest(this.sqlSelectFrom);
    }

    public find = async (id: number): (Promise<ModelType>) => {
        const query = `${this.sqlSelectFrom} ${this.sqlFind}`;
        return CrudService.makeRequest(query, [id]);
    }

    public findMany = async (ids: number[]): (Promise<ModelType>) => {
        const query = `${this.sqlSelectFrom} ${this.sqlFindMany}`;
        return CrudService.makeRequest(query, [ids]);
    }

    public create = async (modelData: KeyedObject<ModelType>) => {
        let tableUpdateData: TableUpdateData<ModelType> = {
            values: [],
            columns: [],
        };

        const updateFields = (Object.keys(modelData) as Array<keyof ModelType>)
            .filter((field: keyof ModelType) => this.safeFields.includes(field))
            .map((field: keyof ModelType) => [field as string, modelData[field as string] as string])
            .reduce<TableUpdateData<ModelType>>((previousValue: TableUpdateData<ModelType>, currentValue: string[]) => ({
                columns: [...previousValue.columns, currentValue[0] as keyof ModelType],
                values: [...previousValue.values, currentValue[1] as string],
            }), tableUpdateData);

        const nValues = updateFields.columns.length;
        const columns = updateFields.columns.join((CrudService.sqlQuerySeparator));
        const values = new Array(nValues).fill(CrudService.sqlVar).join(CrudService.sqlQuerySeparator);
        const sql = `${CrudService.sqlInsertInto} ${this.tableName} (${columns}) ${CrudService.sqlValues} (${values})`;

        return await CrudService.makeRequest(sql, updateFields.values)
            .then((value: OkPacket) => {
                return this.find(Number(value.insertId)).then(inserted => inserted);
            })
            .catch(reason => reason);
    }
}
