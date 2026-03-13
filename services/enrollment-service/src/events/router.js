import { handleSectionCreated } from "./handlers/sectionCreated.js"

export async function routeEvent(channel, event){
    switch(channel){
        case "section.created":
            await handleSectionCreated(event);
            break;
        default:
            console.log("Unhandled event", event)
    }
}