import * as Process from "process";
import {Pool} from "mariadb";

const mariadb = require('mariadb');
const pool: Pool = mariadb.createPool({
    database: Process.env.DB_NAME,
    host: Process.env.DB_HOST,
    user: Process.env.DB_USER,
    password: Process.env.DB_PASSWORD,
    port: Process.env.DB_PORT
})

export const dbPool = () => {
    return Object.freeze({
        pool: pool
    })
}

export const dbService = async (req: any, res: any, next: any) => {
    req.service = dbPool();
    next();
};

module.exports = Object.freeze({
    pool: pool,
})
