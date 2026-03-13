import { pool } from "../../db/postgres.js"

export async function handleSectionCreated(event){
    console.log("Received section.created event!", event)
    const {section_id, course_id, section_number, capacity} = event

    await pool.query(
        `
        INSERT INTO sections (id, course_id, section_number, capacity, seats_remaining)
        VALUES ($1, $2, $3, $4, $4)
        `, [section_id, course_id, section_number, capacity] // initially, remaining seats = capacity
    )
}
