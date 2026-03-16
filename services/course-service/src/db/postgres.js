import pg from "pg"
import { config } from "../config/env.js"

const { Pool } = pg

export const pool = new Pool({
    host: config.postgres.host,
    port: config.postgres.port,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    max: 18,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})
