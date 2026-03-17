import { enrollStudent } from "../controllers/enrollmentController.js";

export async function enrollmentRoutes(fastify){
    fastify.post("/enroll", enrollStudent)
}