import { Worker } from "bullmq";
import { pool } from "../db/postgres";
import { v4 as uuidv4 } from "uuid"

const worker = new Worker(
    "waitlist",
    async (job) => {
        const { studentId, sectionId } = job.data
        const client = pool.connect()

        try {
            await client.query("BEGIN")

            const result = await client.query(`
                SELECT seats_remaining
                FROM sections
                WHERE id = $1
                FOR UPDATE
                `,
                [sectionId]
            )

            if (result.rows.length === 0){
                throw new Error ("Section not found")
            }

            const seatsRemaining = result.rows[0].seats_remaining

            if(seatsRemaining <= 0){
                await client.query("ROLLBACK")
                return
            }

            const enrollmentId = uuidv4()

            await client.query(
                `
                INSERT INTO enrollments (id, student_id, section_id)
                VALUES ($1, $2, $3)
                `, [enrollmentId, studentId, sectionId]
            )

            await client.query(
                `
                UPDATE sections
                SET seats_remaining = seats_remaining - 1
                WHERE id = $1
                `, [sectionId]
            )

            await client.query("COMMIT")

            console.log("Waitlisted student", studentId, " enrolled")
        } catch (err){
            await client.query("ROLLBACK")
            console.error(err)
        } finally {
            await client.release()
        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379
        }
    }
)