import mongoose, {Schema, model} from 'mongoose'

const userSchema = new Schema({
    email: {type: String, unique: true, required: true}, // validate its ends with "@northeastern.edu"
    password: {type: String, required: true},
    studentId: {type: Number, required: true, unique: true}, // ideally this student ID would be verified to make sure the student actually exists
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
    admin: {type: mongoose.Types.ObjectId, ref: "Admin"}, // admin = professor = instructor
    description: String,
    seats: Number, // how many seats are available in this course
})

export const CourseModel = model("Course", courseSchema);