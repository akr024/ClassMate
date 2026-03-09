import Fastify from "fastify"
import { config } from "./config/env.js"

const fastify = Fastify({
    logger: true
})

async function start() {
    try {
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