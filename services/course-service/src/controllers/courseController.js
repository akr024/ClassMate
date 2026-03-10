import { pool } from "../db/postgres.js"
import { v4 as uuidv4 } from "uuid"

export async function createCourse(req, res){
    const { courseCode, name, description } = req.body;
    const id = uuidv4();

    const result = await pool.query(
        `
        INSERT INTO courses (id, courseCode, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [id, courseCode, name, description] // parameterized sql, avoids sql injections
    )

    return res.send(result.rows[0])
}

export async function createSection(req, res){
    const { course_id, section_number, capacity } = req.body;
    const id = uuidv4();

    const result = await pool.query(
        `
        INSERT INTO courses (id, courseCode, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [id, course_id, section_number, capacity] // parameterized sql, avoids sql injections
    )

    return res.send(result.rows[0])
}

export async function getCourses(req, res){
    const result = await pool.query(
        `
        SELECT * FROM courses
        ORDER BY created_at DESC
        `
    )

    return res.send(result.rows)
}

export async function getSections(req, res){
    const result = await pool.query(
        `
        SELECT * FROM sections
        `
    )

    return res.send(result.rows)
}