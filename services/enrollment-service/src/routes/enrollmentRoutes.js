import { deEnrollStudent, enrollStudent } from "../controllers/enrollmentController.js";

export async function enrollmentRoutes(fastify){
    fastify.post("/enroll", enrollStudent)
}

export async function enrollmentRoutes(fastify){
    fastify.post("/deenroll", deEnrollStudent)
}