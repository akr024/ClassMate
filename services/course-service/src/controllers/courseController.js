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

    res.send(result.rows[0])
}