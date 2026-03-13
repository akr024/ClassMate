import { redisClient } from "../config/redis.js"

export async function startSubscriber(handler){
    const subscriber = redisClient.duplicate()
    await subscriber.connect()
    await subscriber.subscribe("section.created", (message) => {
        const data = JSON.parse(message)
        handler(data)
    })
}