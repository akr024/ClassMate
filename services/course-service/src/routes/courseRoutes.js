import { getCourses, getSections, createCourse, createSection } from "../controllers/courseController.js";

export async function courseRoutes(fastify){
    fastify.post("/courses", createCourse)
    fastify.post('/sections', createSection)

    fastify.get("/courses", getCourses);
    fastify.get("/sections", getSections)
}