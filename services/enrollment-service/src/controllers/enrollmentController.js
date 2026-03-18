import { pool } from "../db/postgres.js"
import { v4 as uuidv4 } from "uuid"
import { publishEvent } from "../events/publisher.js";

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
            throw new Error("Section not found")
        }

        const seatsRemaining = sectionResult.rows[0].seats_remaining

        if(seatsRemaining <= 0){
            throw new Error("No seats remaining")
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

export async function deEnrollStudent(req, res){
    const { studentId, sectionId } = req.body
    const client = await pool.connect()

    try{

        await client.query("BEGIN")

        const enrollmentResult = await client.query(
            `
            SELECT id
            FROM enrollments
            WHERE student_id = $1 AND section_id = $2
            FOR UPDATE
            `, [studentId, sectionId]
        )

        if(enrollmentResult.rows.length == 0){
            throw new Error("Student enrollment not found")
        }
        
        await client.query(
            `
            DELETE FROM enrollments
            WHERE student_id = $1 AND section_id = $2
            `, [studentId, sectionId]
        )

        await client.query(
            `
            UPDATE sections
            SET seats_remaining = seats_remaining + 1
            WHERE id = $1
            `, [sectionId]
        )

        await client.query("COMMIT")

        publishEvent("student.dropped", {
            studentId,
            sectionId
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