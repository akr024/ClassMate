import { redisClient } from "../config/redis.js"
import { routeEvent } from "./router.js"

export async function startSubscriber(){
    const subscriber = redisClient.duplicate()
    await subscriber.connect()
    
    await subscriber.subscribe("section.created", async (message) => {
        const event = JSON.parse(message)
        await routeEvent("section.created", event)
    })
}