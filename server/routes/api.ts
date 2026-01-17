import express, {Router} from 'express'
import bcrypt from 'bcrypt'
import {z} from 'zod';
import { UserModel } from '../models/userModel.js';
import userRouter from './userRouter.js';

const apiRouter = express.Router();

apiRouter.use('/users/', userRouter)



export default apiRouter;