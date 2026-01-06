import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { authMiddleware } from './auth.js';

const app = express();

app.use(express.json()); // convert body to json
// app.use(cors()); - enable later, while connecting frontend

// LOGIN/SIGNUP -----------

// sign up student - ideally authenticate student's existence before signing up
app.post('/api/v1/signup', (req, res) => {

})

// log in student
app.post('/api/v1/login', (req, res) => {

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