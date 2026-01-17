import express, {Router} from 'express'
import bcrypt from 'bcrypt'
import {z} from 'zod';
import { UserModel } from '../models/userModel.js';
import userController from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.use('/signup', userController.userSignup)

userRouter.use('/login', userController.userLogin)

export default userRouter;