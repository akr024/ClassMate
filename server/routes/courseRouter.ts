import express from 'express'
import courseController from '../controllers/courseController.js';
import { authMiddleware } from '../auth.js';

const courseRouter = express.Router();

courseRouter.get('/courses', courseController.getAllCourses)

courseRouter.get('/api/v1/courses/:course', authMiddleware, courseController.getSpecificCourse)

courseRouter.post('/api/v1/courses/:course', authMiddleware, courseController.registerInCourse)

courseRouter.delete('/api/v1/courses/:course', authMiddleware, courseController.unregisterFromCourse)

export default courseRouter;