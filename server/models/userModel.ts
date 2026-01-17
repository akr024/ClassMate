import mongoose, {Schema, model} from 'mongoose'

const userSchema = new Schema({
    email: {type: String, unique: true, required: true}, // validate its ends with "@northeastern.edu"
    password: {type: String, required: true},
    studentId: {type: Number, required: true, unique: true}, // ideally this student ID would be verified to make sure the student actually exists
    courses: [{type: mongoose.Types.ObjectId, ref: "Course"}]
    // type: {type: String, enum: ["Undergraduate", "Graduate"]} - later feature
})

export const UserModel = model("User", userSchema);