import { Worker } from "bullmq";
import { pool } from "../db/postgres.js";
import { v4 as uuidv4 } from "uuid";

console.log("🚀 Waitlist Worker starting...");

export const worker = new Worker(
  "waitlist",
  async (job) => {
    console.log("Job received:", job.id, job.data);

    const { sectionId } = job.data;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Lock section
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
        throw new Error("Section not found");
      }

      const seats = sectionRes.rows[0].seats_remaining;

      if (seats <= 0) {
        await client.query("ROLLBACK");
        return;
      }

      // 2. Get earliest waitlisted student
      const waitRes = await client.query(
        `
        SELECT student_id
        FROM waitlist
        WHERE section_id = $1
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
        `,
        [sectionId]
      );

      if (waitRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return;
      }

      const studentId = waitRes.rows[0].student_id;

      // 3. Enroll student
      const enrollmentId = uuidv4();

      await client.query(
        `
        INSERT INTO enrollments (id, student_id, section_id)
        VALUES ($1, $2, $3)
        `,
        [enrollmentId, studentId, sectionId]
      );

      // 4. Remove from waitlist
      await client.query(
        `
        DELETE FROM waitlist
        WHERE student_id = $1 AND section_id = $2
        `,
        [studentId, sectionId]
      );

      // 5. Decrement seat
      await client.query(
        `
        UPDATE sections
        SET seats_remaining = seats_remaining - 1
        WHERE id = $1
        `,
        [sectionId]
      );

      await client.query("COMMIT");

      console.log("Waitlisted student enrolled:", studentId);

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Worker transaction error:", err);

    } finally {
      client.release();
    }
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);