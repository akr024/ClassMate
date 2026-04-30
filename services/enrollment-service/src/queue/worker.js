import { Worker } from "bullmq";
import { pool } from "../db/postgres.js";
import { v4 as uuidv4 } from "uuid";
import { publishEvent } from "../events/publisher.js";

console.log("Waitlist worker starting...");

export const worker = new Worker(
    "waitlist",
    async (job) => {
        if (job.name !== "promote-next") {
            console.log(`Ignoring unknown job type: ${job.name}`);
            return;
        }

        const { sectionId } = job.data;
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // locking the section for update
            const sectionRes = await client.query(
                `
                SELECT seats_remaining
                FROM sections
                WHERE id = $1
                FOR UPDATE
                `,
                [sectionId]
            );

            if (sectionRes.rows.length === 0) {
                await client.query("ROLLBACK");
                console.warn(`Section ${sectionId} not found; nothing to promote`);
                return;
            }

            const seats = sectionRes.rows[0].seats_remaining;

            // in case no seats are available
            if (seats <= 0) {
                await client.query("ROLLBACK");
                console.log(`Section ${sectionId}: no seats available, no-op`);
                return;
            }

            // get the earliest waitlist member for that section
            const waitRes = await client.query(
                `
                SELECT id, student_id
                FROM waitlist
                WHERE section_id = $1
                ORDER BY position ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                `,
                [sectionId]
            );

            if (waitRes.rows.length === 0) {
                // either waitlist empty or another worker is already processing the earliest waitlisted member
                await client.query("ROLLBACK");
                console.log(`Section ${sectionId}: no waitlisted students to promote`);
                return;
            }

            const { id: waitlistId, student_id: studentId } = waitRes.rows[0];

            // adding the enrollment of the student
            const enrollmentId = uuidv4();
            const insertRes = await client.query(
                `
                INSERT INTO enrollments (id, student_id, section_id)
                VALUES ($1, $2, $3)
                ON CONFLICT (student_id, section_id) DO NOTHING
                RETURNING id
                `,
                [enrollmentId, studentId, sectionId]
            );

            // removing that student from the waitlist
            await client.query(
                `
                DELETE FROM waitlist
                WHERE id = $1
                `,
                [waitlistId]
            );

            // decrementing the seats but only if a student was actually 
            // inserted into enrollments (not decrementing for stale waitlist entries)
            if (insertRes.rowCount > 0) {
                await client.query(
                    `
                    UPDATE sections
                    SET seats_remaining = seats_remaining - 1
                    WHERE id = $1
                    `,
                    [sectionId]
                );
            }

            await client.query("COMMIT");

            if (insertRes.rowCount > 0) {
                console.log(`Promoted student ${studentId} into section ${sectionId}`);
                await publishEvent("student.enrolled", {
                    studentId,
                    sectionId,
                    enrollmentId,
                    source: "waitlist-promotion"
                });
            } else {
                console.log(`Cleaned stale waitlist entry for already-enrolled student ${studentId}`);
            }

        } catch (err) {
            await client.query("ROLLBACK");
            console.error("Worker promotion failed:", err);
            // throwing the error records it in bullmq console
            throw err;
        } finally {
            client.release();
        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379
        },
        concurrency: 5
    }
);

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});