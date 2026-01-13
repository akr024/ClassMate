import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt'
import { authMiddleware } from './auth.js';
import { UserModel, CourseModel } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

const app = express();

app.use(express.json()); // convert body to json
// app.use(cors()); - enable later, while connecting frontend

// LOGIN/SIGNUP -----------

// sign up student - ideally authenticate student's existence before signing up
app.post('/api/v1/signup', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const studentId = req.body.studentId;

    // validate email, password and studentId, using zod
    
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

})

// log in student
app.post('/api/v1/login', async (req, res) => {
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
            const token = jwt.sign({id: userFound._id}, JWT_SECRET)
            res.status(201).json({
                message: "User signed in successfully",
                token: token
            })
            return;
        } else {
            return res.status(401).json({
                message: "Invalid token"
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
})

// log in admin (no sign up admin endpoint - design sign up later)
// app.post('/api/v1/admin/login', (req, res) => {

// })

// STUDENT COURSE ENDPOINTS -----------

// view all courses - public, excluding description
app.get('/api/v1/courses', async (req, res) => {
    const courses = await CourseModel.find().select("-description");
    
    if(!courses) {
        return res.status(200).json({
            message: "No courses found"
        })
    }
    return res.status(200).json({
        courses
    });
})

// view a specific course information - public
app.get('/api/v1/courses/:course', async (req, res) => {
    const courseId = req.params.course as string;
    const course = await CourseModel.findOne({
        courseId: courseId
    })
    if(!course){
        res.json({
            message: "Error, the course does not exist"
        })
        return;
    }

    return res.json({
        course: course
    })
})

// register for a specific course - authenticated
app.post('/api/v1/courses/:course', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const courseId = req.params.course as string;
    // check if course has available seats
    // add the student to the students list of the course
    // add the course to the students list of registered courses
    const course = await CourseModel.findOne({
        courseId: courseId
    })

    if(!course){
        return res.status(401).json({
            message: "Error, course does not exist"
        })
    }

    if(course.seats < 1){ // no seat available
        return res.status(409).json({
            message: "No seat left unfortunately"
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
})

// unregister from a course - authenticated
app.delete('/api/v1/courses/:course', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const courseId = req.params.course as string;
    // check if course has available seats
    // add the student to the students list of the course
    // add the course to the students list of registered courses
    // verify if the student is enrolled in the course

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
})

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
app.listen(3000, () => {
    // mongoose.connect("") - connect to db, later
    console.log("Server started on PORT 3000!")
})