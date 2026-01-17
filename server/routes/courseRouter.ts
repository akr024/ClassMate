import express from 'express'
import courseController from '../controllers/courseController.js';
import { authMiddleware } from '../auth.js';

const courseRouter = express.Router();

// to get all courses (excluding description)
courseRouter.get('/', courseController.getAllCourses)

// to get a specific course (including description)
courseRouter.get('/courses/:course', authMiddleware, courseController.getSpecificCourse)

// to register in a course
courseRouter.post('/courses/:course', authMiddleware, courseController.registerInCourse)

// to unregister from a specific course
courseRouter.delete('/courses/:course', authMiddleware, courseController.unregisterFromCourse)

export default courseRouter;