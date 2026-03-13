import Fastify from "fastify"
import { config } from "./config/env.js"
import { pool } from "./db/postgres.js"
import { redisClient } from "./config/redis.js"
import { startSubscriber } from "./events/subscriber.js"

const fastify = Fastify({
    logger: true
})

const start = async () => {
    try{
        await pool.query("SELECT 1")
        console.log("DB Connected!")

        await redisClient.connect()
        console.log("Redis pub/sub connected")

        await startSubscriber((message) => {
            console.log("Received section.created event!", message)
        })

        await fastify.listen({
            port: config.port,
            host: "0.0.0.0"
        })

        console.log("Enrollment service running on port", config.port)
    } catch(err){
        console.log("Error while running Enrollment Service", err)
        process.exit(1)
    }
}

start()
