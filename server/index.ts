import express, {Router} from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt'
import { authMiddleware } from './auth.js';
import { CourseModel } from './models/courseModel.js';
import { UserModel } from './models/userModel.js';
import 'dotenv/config'; // to load env variables
import * as z from "zod"; 
import mongoose from 'mongoose';
import apiRouter from './routes/api.js'

const PORT = process.env.PORT
const MONGO_DB = process.env.MONGO_DB
if(!MONGO_DB) throw new Error("MONGO DB connective link missing")
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

const app = express();

app.use(express.json()); // convert body to json
// app.use(cors()); - enable later, while connecting frontend

// NEXT STEPS:
// 1. hit endpoints to see if they work
// 2. add zod input validation in all endpoints
// 3. seperate all files into MVC-based structure
// 4. start with the frontend

app.use('/api/v1/', apiRouter)

// ADMIN COURSE ENDPOINTS -----------

// work on admin points later

// admin: post a new course - admin authenticated
// TEMPORARILY, let a student create a course, to test endpoints in frontend
app.post('/api/v1/admin/courses', authMiddleware, async (req, res) => {
    const courseName = req.body.courseName;
    const courseId = req.body.courseId;
    const description = req.body.description;
    const seats = req.body.seats;
    const userId = req.userId;

    if(!userId){
        return res.json({
            message: "UserId not provided"
        })
    }

    // add input validation for the properties using zod

    try{
        await CourseModel.create({
            courseName,
            courseId,
            admin: userId,
            description,
            seats
        })

        return res.status(201).json({
            message: "Course created successfully"
        })
    } catch(err){
        if(err instanceof Error){
            return res.status(501).json({
                message: "Error: \n" + err.message
            })
        } 
        return res.status(501).json({
            message: "Error in creating a course"
        })
    }
})

// // admin: update an existing course
// TEMPORARILY, let a student update a course, to test endpoints in frontend
app.put('/api/v1/admin/courses/:course', authMiddleware, async (req, res) => {
    const courseName = req.body.courseName;
    // cannot change a courseId
    const description = req.body.description;
    const seats = req.body.seats;
    const courseId = req.params.course;
    const userId = req.userId;

    if(!userId){
        return res.status(400).json({
            message: "Error: User ID not provided"
        })
    }

    if(!courseId){
        return res.status(401).json({
            message: "Course ID not provided"
        })
    }
    
    try{
        await CourseModel.findOne({
            courseId: courseId,
            admin: userId
        })
    } catch (err){
        return res.status(400).json({
            message: "Error, course not found or user not admin"
        })
    }
    
    try {
        await CourseModel.updateOne({
            courseId: courseId
        }, {
            courseName: courseName,
            description: description,
            seats: seats
        })

        res.status(200).json({
            message: "Course successfully updated"
        })
    } catch (err) {
        if(err instanceof Error){
            return res.status(501).json({
                message: "Error: \n" + err.message
            })
        } 
        return res.status(501).json({
            message: "Error in updating the course"
        })
    }
})

// // admin: delete an existing course
// TEMPORARILY, let a student delete a course, to test endpoints in frontend
app.delete('/api/v1/admin/courses/:course', authMiddleware, async (req, res) => {
    const courseId = req.params.course;
    const userId = req.userId;
    
    if(!userId){
        return res.status(401).json({
            message: "User ID not provided"
        })
    }

    if(!courseId){
        return res.status(401).json({
            message: "Course ID not provided"
        })
    }
    
    // improve specific error handling better later

    try{
        const courseValid = await CourseModel.findOne({
            courseId: courseId,
            admin: userId
        })
        
        if (courseValid){
            await CourseModel.deleteOne({
                courseId: courseId
            })
        }

        return res.status(200).json({
            message: "Course deleted successfully"
        })
    } catch (err){
        if(err instanceof Error){
            return res.json({
                message: "Error \n" + err.message
            })
        }
        
        return res.status(400).json({
            message: "Error: Course ID not valid, User not admin, or server error with deletion"
        })
    }
})

// start server
app.listen(PORT, async () => {
    try{
        await mongoose.connect(MONGO_DB);
        console.log("Server started on PORT 3000!");
    } catch (err){
        console.log("Error with mongoose connecting to DB!")
        return;
    }
})