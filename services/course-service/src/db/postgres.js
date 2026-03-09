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

// client = pool.connect() - for multiple queries, using single client
// pool.query() - for single query, any random client from the pool is chosen
pool.connect()
    .then(client => {
        console.log("Course service DB successfully connected!")
        client.release()
    })
    .catch((err) => {
        console.log("Error connecitng to course service DB:", err)
    })
