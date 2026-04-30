import { pool } from "../db/postgres.js"
import { v4 as uuidv4 } from "uuid"
import { publishEvent } from "../events/publisher.js";
import { waitlistQueue } from "../queue/waitlistQueue.js";

export async function enrollStudent(req, res) {
    const { studentId, sectionId } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const decrementResult = await client.query(
            `
            UPDATE sections
            SET seats_remaining = seats_remaining - 1
            WHERE id = $1 AND seats_remaining > 0
            RETURNING seats_remaining
            `,
            [sectionId]
        );

        if (decrementResult.rowCount === 1) {
            const enrollmentId = uuidv4();
            try {
                await client.query(
                    `
                    INSERT INTO enrollments (id, student_id, section_id)
                    VALUES ($1, $2, $3)
                    `,
                    [enrollmentId, studentId, sectionId]
                );
            } catch (err) {
                if (err.code === "23505") {
                    await client.query("ROLLBACK");
                    return res.status(409).send({
                        error: "Student already enrolled in this section"
                    });
                }
                throw err;
            }

            await client.query("COMMIT");

            await publishEvent("student.enrolled", { studentId, sectionId, enrollmentId });
            return res.send({ success: true, enrollmentId });
        }

        const sectionCheck = await client.query(
            `SELECT 1 FROM sections WHERE id = $1`,
            [sectionId]
        );
        if (sectionCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).send({ error: "Section not found" });
        }

        const positionResult = await client.query(
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

    } catch (err) {
        await client.query("ROLLBACK");
        return res.status(400).send({ error: err.message });
    } finally {
        client.release();
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
        await waitlistQueue.add("promote-next", { sectionId });

        return res.send({ success: true });

    } catch (err) {
        await client.query("ROLLBACK");
        return res.status(400).send({ error: err.message });
    } finally {
        client.release();
    }
}