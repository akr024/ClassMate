import {type Request, type Response} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { UserModel } from '../models/userModel.js';
import 'dotenv/config'; // to load env variables
import * as z from "zod"; 

const MONGO_DB = process.env.MONGO_DB
if(!MONGO_DB) throw new Error("MONGO DB connective link missing")
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

// sign up student - ideally authenticate student's existence before signing up
async function userSignup (req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;
    const studentId = req.body.studentId;

    const userDetails = {
        email,
        password,
        studentId
    }

    // validate email, password and studentId, using zod

    const userValidation = z.object({
        email: z.string().min(18).endsWith("@northeastern.edu"), // min 18 characters including @northeastern.edu
        password: z.string().min(5),
        studentId: z.number()
    })
    
    const validationResult = userValidation.safeParse(userDetails);

    if(!validationResult.success){
        return res.status(401).json({
            message: "Error with input validaiton:\n" + validationResult.error
        })
    }

    const hashedPass = await bcrypt.hash(password, 10);
    
    try{
        await UserModel.create({
            email,
            password: hashedPass,
            studentId
        })

        res.status(201).json({
            message: "User created successfully"
        })
        return;
    } catch(err){
        if(err instanceof Error){
            res.status(400).json({
            message: "User could not be created due to following error:\n" + err.message
        })
        }
        return;
    }
}

// log in student
async function userLogin(req: any, res: any) {
    const email = req.body.email;
    const password = req.body.password;

    try{
        const userFound = await UserModel.findOne({
            email
        })

        if(!userFound){
            return res.status(400).json({
                message: "User not found via email"
            })
        }

        const isValid = await bcrypt.compare(password, userFound.password)

        if(isValid){
            const token = jwt.sign({id: userFound._id}, JWT_SECRET as string)
            res.status(201).json({
                message: "User signed in successfully",
                token: token
            })
            return;
        } else {
            return res.status(401).json({
                message: "Incorrect password"
            })
        }
    } catch(err){
        if(err instanceof Error){
            return res.status(400).json({
                message: "User could not be signed in:\n" + err.message
            })   
        }
        return res.status(500).json({
            message: "User could not be signed in"
        })
    }
}

const userController = {
    userSignup,
    userLogin
}

export default userController;