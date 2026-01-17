import {type Request, type Response} from 'express';
import 'dotenv/config'; // to load env variables
import * as z from "zod"; // input validation
import { CourseModel } from '../models/courseModel.js';

const MONGO_DB = process.env.MONGO_DB
if(!MONGO_DB) throw new Error("MONGO DB connective link missing")
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

async function addCourse(req: Request, res: Response) {
    const courseName = req.body.courseName;
    const courseId = req.body.courseId;
    const description = req.body.description;
    const seats = req.body.seats;
    const userId = req.userId; // no validation required as assigned from middleware

    if(!userId){
        return res.json({
            message: "UserId not provided"
        })
    }

    const courseDetails = {
        courseName,
        courseId,
        description,
        seats
    }

    // validate email, password and studentId, using zod

    const adminValidation = z.object({
        courseName: z.string().length(1), // make it more strict later
        courseId: z.number(),
        description: z.string().length(1),
        seats: z.number().gt(0)
    })
    
    const validationResult = adminValidation.safeParse(courseDetails);

    if(!validationResult.success){
        return res.status(401).json({
            message: "Error with input validaiton:\n" + validationResult.error
        })
    }

    // zod validation

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
}

async function editSpecificCourse(req: Request, res: Response) {
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

    const courseDetails = {
        courseName,
        courseId,
        description,
        seats
    }

    // validate email, password and studentId, using zod

    const adminValidation = z.object({
        courseName: z.string().length(1), // make it more strict later
        courseId: z.number(),
        description: z.string().length(1),
        seats: z.number().gt(0)
    })
    
    const validationResult = adminValidation.safeParse(courseDetails);

    if(!validationResult.success){
        return res.status(401).json({
            message: "Error with input validaiton:\n" + validationResult.error
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
}

async function deleteSpecificCourse(req: Request, res: Response) {
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

    const courseDetails = {
        courseId
    }

    const adminValidation = z.object({
        courseId: z.number()
    })
    
    const validationResult = adminValidation.safeParse(courseDetails);

    if(!validationResult.success){
        return res.status(401).json({
            message: "Error with input validaiton:\n" + validationResult.error
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
}


const adminController = {
    addCourse,
    editSpecificCourse,
    deleteSpecificCourse
}

export default adminController;