import express from 'express';
import 'dotenv/config'; // to load env variables
import mongoose from 'mongoose';
import apiRouter from './routes/api.js'

const PORT = process.env.PORT
const MONGO_DB = process.env.MONGO_DB
if(!MONGO_DB) throw new Error("MONGO DB connective link missing")
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

const app = express();

app.use(express.json()); // convert body to json
// app.use(cors()); - enable later, while connecting frontend

app.use('/api/v1/', apiRouter)

// start server
app.listen(PORT, async () => {
    try{
        await mongoose.connect(MONGO_DB);
        console.log("Server started on PORT 3000!");
    } catch (err){
        console.log("Error with mongoose connecting to DB!")
        return;
    }
})