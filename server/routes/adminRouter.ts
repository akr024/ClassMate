import express from 'express'
import { authMiddleware } from '../auth.js';

const adminRouter = express.Router();

adminRouter.post('/courses', authMiddleware, adminController.addCourse)

adminRouter.put('/courses/:course', authMiddleware, adminController.editSpecificCourse)

adminRouter.delete('/courses/:course', authMiddleware, adminController.registerInCourse)

export default adminRouter;