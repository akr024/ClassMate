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
// POSTMAN TESTED
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

// POSTMAN TESTED
async function registerInCourse(req: Request, res: Response) {
    const userId = req.userId;
    const courseId = req.params.course as string;

    const courseValidation = z.object({
        courseId: z.string()
    });
    
    const validationResult = courseValidation.safeParse({ courseId });
    if (!validationResult.success) {
        return res.status(401).json({
            message: "Error with input validation:\n" + validationResult.error
        });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(401).json({
            message: "Error, user does not exist"
        });
    }

    const course = await CourseModel.findOneAndUpdate(
        { 
            courseId,
            seats: { $gt: 0 }, // concurrency control through atomicity
            students: { $ne: user._id }
        },
        { 
            $inc: { seats: -1 }, 
            $addToSet: { students: user._id }
        },
        { new: true }
    );

    if (!course) {
        const existingCourse = await CourseModel.findOne({ courseId });
        if (!existingCourse) {
            return res.status(401).json({ message: "Course does not exist" });
        }
        if (existingCourse.students.includes(user._id)) {
            return res.status(409).json({ message: "User already registered for the course" });
        }
        if (existingCourse.seats < 1) {
            return res.status(409).json({ message: "No seat left unfortunately" });
        }
        return res.status(500).json({ message: "Failed to register due to unknown reason" });
    }

    await UserModel.updateOne(
        { _id: user._id },
        { $addToSet: { courses: course._id } }
    );

    return res.status(202).json({
        message: "Student successfully registered"
    });
}

async function unregisterFromCourse(req: Request, res: Response) {
    const userId = req.userId;
    const courseId = req.params.course as string;
    // check if course has available seats
    // add the student to the students list of the course
    // add the course to the students list of registered courses
    // verify if the student is enrolled in the course

    const courseValidation = z.object({
        courseId: z.string()
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
            _id: course._id
        }, {
            seats: course.seats + 1,
            $pull: {students: user._id}
        })

        await UserModel.updateOne({
            _id: user._id
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