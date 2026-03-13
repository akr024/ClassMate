import { redisClient } from "../config/redis.js"

export async function publishEvent(channel, payload){
    const message = JSON.stringify(payload)
    await redisClient.publish(channel, message)
    console.log(`Event published to ${channel}, with payload`, payload)
}