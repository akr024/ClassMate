import {type Request, type Response} from 'express';
import { UserModel } from '../models/userModel.js';
import 'dotenv/config'; // to load env variables
import * as z from "zod"; 
import { CourseModel } from '../models/courseModel.js';

const MONGO_DB = process.env.MONGO_DB
if(!MONGO_DB) throw new Error("MONGO DB connective link missing")
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

// view all courses
// POSTMAN TESTED
async function getAllCourses(req: Request, res: Response) {
    const courses = await CourseModel.find().select("-description");

    if(courses.length === 0) {
        return res.status(200).json({
            message: "No courses found"
        })
    }
    return res.status(200).json({
        courses
    });
}

// view a specific course information - public

async function getSpecificCourse(req: Request, res: Response) {
    const courseId = req.params.course as string;

    const courseValidation = z.object({
        courseId: z.string()
    })
    
    const validationResult = courseValidation.safeParse({courseId});

    if(!validationResult.success){
        return res.status(401).json({
            message: "Error with input validaiton:\n" + validationResult.error
        })
    }

    const course = await CourseModel.findOne({
        courseId: courseId
    })

    if(!course){
        res.status(401).json({
            message: "Error, the course does not exist"
        })
        return;
    }

    return res.status(200).json({
        course
    })
}

async function registerInCourse(req: Request, res: Response) {
    const userId = req.userId;
    const courseId = req.params.course as string;
    // check if course has available seats
    // add the student to the students list of the course
    // add the course to the students list of registered courses


    const courseValidation = z.object({
        courseId: z.number()
    })
    
    const validationResult = courseValidation.safeParse({courseId});

    if(!validationResult.success){
        return res.status(401).json({
            message: "Error with input validaiton:\n" + validationResult.error
        })
    }

    const course = await CourseModel.findOne({
        courseId: courseId
    })

    if(!course){
        return res.status(401).json({
            message: "Error, course does not exist"
        })
    }

    const user = await UserModel.findOne({
        _id: userId
    })

    if(!user){
        return res.status(401).json({
            message: "Error, user does not exist"
        })
    }

    if(course.seats < 1){ // no seat available
        return res.status(409).json({
            message: "No seat left unfortunately"
        })
    }

    // check if the user is already a student

    if(course.students.includes(user._id)){
        return res.status(401).json({
            message: "Error, user already registered for the course"
        })
    }

    try{
        await CourseModel.updateOne({
            course
        }, {
            seats: course.seats - 1,
            students: [...course.students, user]
        })

        await UserModel.updateOne({
            user
        }, {
            courses: [...user.courses, course]
        })

        return res.status(202).json({
            message: "Student successfully registered"
        })
    } catch(err){
        if(err instanceof Error){
            return res.status(500).json({
                message: "Error: \n" + err.message
            })
        }
        return res.status(500).json({
            message: "Error in course registration"
        })
    }
}

async function unregisterFromCourse(req: Request, res: Response) {
    const userId = req.userId;
    const courseId = req.params.course as string;
    // check if course has available seats
    // add the student to the students list of the course
    // add the course to the students list of registered courses
    // verify if the student is enrolled in the course

    const courseValidation = z.object({
        courseId: z.number()
    })
    
    const validationResult = courseValidation.safeParse({courseId});

    if(!validationResult.success){
        return res.status(401).json({
            message: "Error with input validaiton:\n" + validationResult.error
        })
    }

    const user = await UserModel.findOne({
        _id: userId
    })

    if(!user){
        return res.status(401).json({
            message: "Error, user does not exist"
        })
    }

    const course = await CourseModel.findOne({
        courseId: courseId,
        students: user._id // works because students: [ObjectId('213'), ObjectId('323)]
    })

    if(!course){
        return res.status(401).json({
            message: "Error, student not enrolled in course or course does not exist"
        })
    }

    try{
        await CourseModel.updateOne({
            course
        }, {
            seats: course.seats + 1,
            $pull: {students: user._id}
        })

        await UserModel.updateOne({
            user
        }, {
            $pull: {
                courses: course._id
            },
        })

        return res.status(202).json({
            message: "Student successfully unregistered"
        })
    } catch(err){
        if(err instanceof Error){
            return res.status(500).json({
                message: "Error: \n" + err.message
            })
        }
        return res.status(500).json({
            message: "Error in unregistrating course"
        })
    }
}

const courseController = {
    getAllCourses,
    getSpecificCourse,
    registerInCourse,
    unregisterFromCourse
}

export default courseController;