import mongoose, {Schema, model} from 'mongoose'

const courseSchema = new Schema({
    courseName: {type: String, required: true},
    courseId: {type: String, required: true, unique: true},
    // admin: {type: mongoose.Types.ObjectId, ref: "Admin", required: true}, // admin = professor = instructor
    admin: {type: mongoose.Types.ObjectId, ref: "User", required: true}, // temporarily until Admin is designed later
    description: {type: String, required: true},
    seats: {type: Number, required: true}, // how many seats are available in this course
    students: [{type: mongoose.Types.ObjectId, ref: "User"}] // change "User" to "Student"
})

export const CourseModel = model("Course", courseSchema);

// only an existing admin can add another admin - for now, this is how authentication of admins is done
// const adminSchema = new Schema({
//     email: {type: String, unique: true, required: true},
//     password: {type: String, required: true},
//     adminId: {type: Number, required: true, unique: true}
// })

// export const AdminModel = model("Admin", adminSchema);