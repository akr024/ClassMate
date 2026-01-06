import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt'
import { authMiddleware } from './auth.js';
import { UserModel, AdminModel, CourseModel } from './db.js';

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
        res.status(400).json({
            message: "User could not be created\n" + err
        })
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
        }
    } catch(err){
        res.status(400).json({
            message: "User could not be created\n" + err
        })
        return;
    }
})

// log in admin (no sign up admin endpoint - design sign up later)
app.post('/api/v1/admin/login', (req, res) => {

})

// STUDENT COURSE ENDPOINTS -----------

// view all courses - public
app.get('/api/v1/courses', (req, res) => {

})

// view a specific course information - public
app.get('/api/v1/courses/:course', (req, res) => {

})

// register for a specific course - authenticated
app.post('/api/v1/courses/:course', authMiddleware, (req, res) => {

})

// unregister from a course - authenticated
app.post('/api/v1/courses/:course', authMiddleware, (req, res) => {

})

// ADMIN COURSE ENDPOINTS -----------

// admin: post a new course - admin authenticated
app.post('/api/v1/admin/courses', (req, res) => {

})

// admin: update an existing course
app.put('/api/v1/admin/courses/:course', (req, res) => {

})

// admin: delete an existing course
app.delete('/api/v1/admin/courses/:course', (req, res) => {

})

// start server
app.listen(3000, () => {
    // mongoose.connect("") - connect to db, later
    console.log("Server started on PORT 3000!")
})