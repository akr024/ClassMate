import { redisClient } from "../config/redis.js"

export async function publishEvent(channel, payload){
    await redisClient.publish(channel, JSON.stringify(payload))
}