import { enrollStudent } from "../controllers/eventController.js";

export async function enrollmentRoutes(fastify){
    fastify.post("/enroll", enrollStudent)
}