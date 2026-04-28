import { pool } from "../db/postgres.js"
import { v4 as uuidv4 } from "uuid"
import { publishEvent } from "../events/publisher.js";

export async function createCourse(req, res){
    const { courseCode, name, description } = req.body;
    const id = uuidv4();

    const result = await pool.query(
        `
        INSERT INTO courses (id, course_code, name, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [id, courseCode, name, description] // parameterized sql, avoids sql injections
    )

    return res.send(result.rows[0])
}

export async function createSection(req, res){
    const { courseId, sectionNumber, capacity } = req.body;
    const id = uuidv4();

    const result = await pool.query(
        `
        INSERT INTO sections (id, course_id, section_number, capacity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [id, courseId, sectionNumber, capacity] // parameterized sql, avoids sql injections
    )

    publishEvent("section.created", {
        sectionId: id,
        courseId,
        sectionNumber,
        capacity
    })

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