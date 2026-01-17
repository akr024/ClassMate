import express, {Router} from 'express'
import bcrypt from 'bcrypt'
import {z} from 'zod';
import { UserModel } from '../models/userModel.js';
import userRouter from './userRouter.js';
import courseRouter from './courseRouter.js';

const apiRouter = express.Router();

apiRouter.use('/users/', userRouter)

apiRouter.use('/courses/', courseRouter)


export default apiRouter;