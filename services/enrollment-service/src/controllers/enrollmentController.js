import { pool } from "../db/postgres.js"
import { v4 as uuidv4 } from "uuid"
import { publishEvent } from "../events/publisher.js";
import { waitlistQueue } from "../queue/waitlistQueue.js";

export async function enrollStudent(req, res){
    const { studentId, sectionId } = req.body;
    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const sectionResult = await client.query(
            `
            SELECT seats_remaining
            FROM sections
            WHERE id = $1
            FOR UPDATE
            `, [sectionId]
        )

        if(sectionResult.rows.length == 0){
            await client.query("ROLLBACK");
            return res.status(404).send({ error: "Section not found" });
        }

        const seatsRemaining = sectionResult.rows[0].seats_remaining

        // no seats, waitlist the student
        if(seatsRemaining <= 0){
            const positionResult = await client.query( // position max + 1 as the next higher position in the queue (previous last position + 1)
                `
                SELECT COALESCE(MAX(position), 0) + 1 AS next_position
                FROM waitlist
                WHERE section_id = $1
                `,
                [sectionId]
            );
            const nextPosition = positionResult.rows[0].next_position;

            const waitlistId = uuidv4();
            const insertResult = await client.query(
                `
                INSERT INTO waitlist (id, student_id, section_id, position)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (student_id, section_id) DO NOTHING
                RETURNING position
                `,
                [waitlistId, studentId, sectionId, nextPosition]
            );

            await client.query("COMMIT");

            // if the student is already on the wailist
            if (insertResult.rowCount === 0) {
                const existing = await pool.query(
                    `SELECT position FROM waitlist WHERE student_id = $1 AND section_id = $2`,
                    [studentId, sectionId]
                );
                return res.send({
                    waitlisted: true,
                    alreadyOnWaitlist: true,
                    position: existing.rows[0]?.position ?? null
                });
            }

            return res.send({
                waitlisted: true,
                position: insertResult.rows[0].position
            });
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

        await client.query('COMMIT')

        publishEvent("student.enrolled", {
            studentId,
            sectionId,
            enrollmentId
        })

        return res.send({
            success: true
        })

    } catch (err){
        await client.query("ROLLBACK")
        return res.status(400).send({
            error: err.message
        })
    } finally {
        client.release()
    }
}

export async function deEnrollStudent(req, res) {
    const { studentId, sectionId } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const enrollmentResult = await client.query(
            `
            SELECT id
            FROM enrollments
            WHERE student_id = $1 AND section_id = $2
            FOR UPDATE
            `,
            [studentId, sectionId]
        );

        if (enrollmentResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).send({ error: "Student enrollment not found" });
        }

        await client.query(
            `
            DELETE FROM enrollments
            WHERE student_id = $1 AND section_id = $2
            `,
            [studentId, sectionId]
        );

        await client.query(
            `
            UPDATE sections
            SET seats_remaining = seats_remaining + 1
            WHERE id = $1
            `,
            [sectionId]
        );

        await client.query("COMMIT");

        await publishEvent("student.dropped", { studentId, sectionId });
        await waitlistQueue.add("process-waitlist", { sectionId });

        return res.send({ success: true });

    } catch (err) {
        await client.query("ROLLBACK");
        return res.status(400).send({ error: err.message });
    } finally {
        client.release();
    }
}