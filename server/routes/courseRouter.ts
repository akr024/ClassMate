import express from 'express'
import courseController from '../controllers/courseController.js';
import { authMiddleware } from '../auth.js';

const courseRouter = express.Router();

courseRouter.get('/', courseController.getAllCourses)

courseRouter.get('/courses/:course', authMiddleware, courseController.getSpecificCourse)

courseRouter.post('/courses/:course', authMiddleware, courseController.registerInCourse)

courseRouter.delete('/courses/:course', authMiddleware, courseController.unregisterFromCourse)

export default courseRouter;