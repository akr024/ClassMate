import { Worker } from "bullmq";
import { pool } from "../db/postgres";

const worker = new Worker(
    "waitlist",
    async (job) => {
        const { studentId, studentSection } = job.data
        const client = pool.connect()

        try {

        } catch (err){

        } finally {

        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379
        }
    }
)