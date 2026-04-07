import { Queue } from "bullmq"
import { redisClient } from "../config/redis.js"

export const waitlistQueue = new Queue("waitlist", {
    connection: {
        host: "127.0.0.1",
        port: 6739
    }
})