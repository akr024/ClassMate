import pg from "pg";
import { randomUUID } from "node:crypto";

const COURSE_SERVICE = "http://localhost:3001";
const ENROLLMENT_SERVICE = "http://localhost:3002";

const N_REQUESTS = 500;
const SECTION_CAPACITY = 10;

const pool = new pg.Pool({
    host: "localhost",
    port: 5432,
    user: "postgresuser",
    password: "postgres",
    database: "enrollment_service_db"
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


async function createSection() {
    const courseCode = `LOAD-${Date.now()}`;

    const courseResp = await fetch(`${COURSE_SERVICE}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            courseCode,
            name: "Load Test Course",
            description: "Auto-generated"
        })
    });
    const course = await courseResp.json();

    const sectionResp = await fetch(`${COURSE_SERVICE}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            courseId: course.id,
            sectionNumber: 1,
            capacity: SECTION_CAPACITY
        })
    });
    const section = await sectionResp.json();

    await sleep(500);

    return section.id;
}


async function enroll(sectionId, studentId) {
    const resp = await fetch(`${ENROLLMENT_SERVICE}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, sectionId })
    });
    return resp.json();
}

async function fireConcurrentEnrollments(sectionId) {
    const studentIds = Array.from({ length: N_REQUESTS }, () => randomUUID());

    const start = Date.now();
    const responses = await Promise.all(
        studentIds.map((sid) => enroll(sectionId, sid))
    );
    const wallMs = Date.now() - start;

    return { responses, wallMs };
}


async function checkResults(sectionId, responses) {
    const serverEnrolled = responses.filter((r) => r.success === true).length;

    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS c FROM enrollments WHERE section_id = $1`,
        [sectionId]
    );
    const dbEnrolled = rows[0].c;

    return {
        serverEnrolled,
        dbEnrolled,
        oversubscribed: dbEnrolled > SECTION_CAPACITY,
        mismatch: serverEnrolled !== dbEnrolled
    };
}


async function main() {
    console.log(`Load test: ${N_REQUESTS} concurrent requests, ${SECTION_CAPACITY} seats`);

    const sectionId = await createSection();
    console.log(`Section created: ${sectionId}`);

    const { responses, wallMs } = await fireConcurrentEnrollments(sectionId);
    console.log(`Completed in ${wallMs}ms (${(N_REQUESTS / wallMs * 1000).toFixed(0)} req/s)`);

    const result = await checkResults(sectionId, responses);
    console.log(`Server side enrolled: ${result.serverEnrolled}`);
    console.log(`DB enrollments:       ${result.dbEnrolled}`);

    if (result.oversubscribed) {
        console.log(`FAIL: oversubscribed — DB has ${result.dbEnrolled} enrollments, capacity is ${SECTION_CAPACITY}`);
        process.exit(1);
    }
    if (result.mismatch) {
        console.log(`FAIL: server response count (${result.serverEnrolled}) does not match DB count (${result.dbEnrolled})`);
        process.exit(1);
    }
    if (result.dbEnrolled !== SECTION_CAPACITY) {
        console.log(`FAIL: expected exactly ${SECTION_CAPACITY} enrollments, got ${result.dbEnrolled}`);
        process.exit(1);
    }

    console.log(`PASS: ${SECTION_CAPACITY} students enrolled, ${N_REQUESTS - SECTION_CAPACITY} waitlisted, no oversubscription.`);
    await pool.end();
}

main();