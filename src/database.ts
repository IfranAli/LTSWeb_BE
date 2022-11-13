import * as Process from "process";

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    database: Process.env.DB_NAME,
    host: Process.env.DB_HOST,
    user: Process.env.DB_USER,
    password: Process.env.DB_PASSWORD,
    port: Process.env.DB_PORT
})

module.exports = Object.freeze({
    pool: pool,
})