import Fastify from "fastify"
import { config } from "./config/env.js"
import { pool } from "./db/postgres.js"
import { courseRoutes } from "../routes/courseRoutes.js"

const fastify = Fastify({
    logger: true
})

fastify.register(courseRoutes)

async function start() {
    try {
        await pool.query("SELECT 1")

        await fastify.listen({
            port: config.port,
            host: "0.0.0.0"
        })
        
        console.log(`Course Service running on port ${config.port}`)
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}

start()