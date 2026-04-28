import { pool } from "../../db/postgres.js"

export async function handleSectionCreated(event){
    console.log("Received section.created event!", event)
    const {sectionId, courseId, sectionNumber, capacity} = event
    try {
        const result = await pool.query(
            `
            INSERT INTO sections (id, course_id, section_number, capacity, seats_remaining)
            VALUES ($1, $2, $3, $4, $4)
            ON CONFLICT (id) DO NOTHING
            `, [sectionId, courseId, sectionNumber, capacity] // initially, remaining seats = capacity
        )

        if (result.rowCount === 0) {
            console.log(`section.created ignored (already processed): ${sectionId}`);
        } else {
            console.log(`section.created handled: ${sectionId}`);
        }
    } catch (err) {
        // log but don't rethrow as we don't want one bad event to crash the
        // subscriber and stop all future events from being processed.
        console.error(`Failed to handle section.created for ${sectionId}:`, err);
    }
}
