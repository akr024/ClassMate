import mongoose, {Schema, model} from 'mongoose'

const userSchema = new Schema({
    email: {type: String, unique: true, required: true}, // validate its ends with "@northeastern.edu"
    password: {type: String, required: true},
    studentId: {type: Number, required: true, unique: true}, // ideally this student ID would be verified to make sure the student actually exists
    courses: [{type: mongoose.Types.ObjectId, ref: "Course"}]
    // type: {type: String, enum: ["Undergraduate", "Graduate"]} - later feature
})

export const UserModel = model("User", userSchema);

// only an existing admin can add another admin - for now, this is how authentication of admins is done
const adminSchema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    adminId: {type: Number, required: true, unique: true}
})

export const AdminModel = model("Admin", adminSchema);

const courseSchema = new Schema({
    courseName: {type: String, required: true},
    courseId: {type: String, required: true, unique: true},
    admin: {type: mongoose.Types.ObjectId, ref: "Admin", required: true}, // admin = professor = instructor
    description: {type: String, required: true},
    seats: {type: Number, required: true}, // how many seats are available in this course
    students: [{type: mongoose.Types.ObjectId, ref: "User"}] // change "User" to "Student"
})

export const CourseModel = model("Course", courseSchema);