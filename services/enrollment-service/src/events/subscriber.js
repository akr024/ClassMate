import { redisClient } from "../config/redis.js"
import { handleSectionCreated } from "./handlers/sectionCreated.js"

export async function startSubscriber(){
    const subscriber = redisClient.duplicate()
    await subscriber.connect()
    
    await subscriber.subscribe("section.created", async (message) => {
        const event = JSON.parse(message)
        await handleSectionCreated(event)
    })
}