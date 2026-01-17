import express from 'express'
import { authMiddleware } from '../middleware/auth.js';
import adminController from '../controllers/adminController.js';

const adminRouter = express.Router();

// to add a new course
adminRouter.post('/courses', authMiddleware, adminController.addCourse)

// to edit an existing course
adminRouter.put('/courses/:course', authMiddleware, adminController.editSpecificCourse)

// to delete an existing course
adminRouter.delete('/courses/:course', authMiddleware, adminController.deleteSpecificCourse)

export default adminRouter;