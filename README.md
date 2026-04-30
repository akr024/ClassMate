# ClassMate

A backend for course registration, built to handle the concurrency problem that real university registration systems work around by staggering students into time-slotted groups.

## The problem

When my university opens registration, students are split into groups that register on different days. The reason — as far as I can tell from the outside — is that their backend can't handle the full concurrent load. Staggering reduces concurrency administratively. It works, but it's a workaround for a backend limitation.

This project is a backend that doesn't need that workaround. When N students all click "enroll" simultaneously on a section with K seats: exactly K end up enrolled, the other N-K end up on a FIFO waitlist, and the system doesn't collapse into lock contention.

## Architecture

Two services, each with its own Postgres database, communicating over Redis pub/sub:

- **course-service** (port 3001): create courses and sections.
- **enrollment-service** (port 3002): handle `/enroll` and `/deenroll`.
- **worker process**: separate Node process consuming a BullMQ queue. Promotes the head of a waitlist into a freed seat when a student deenrolls.

When a section is created, course-service publishes a `section.created` event that enrollment-service projects into its own `sections` table. Each service owns its data.

## What's interesting in the code

**Race-free seat allocation.** The naive approach is `SELECT FOR UPDATE` → check in app code → `UPDATE`. Correct, but holds the row lock across the entire transaction. Instead, `/enroll` uses a single atomic statement:

```sql
UPDATE sections
SET seats_remaining = seats_remaining - 1
WHERE id = $1 AND seats_remaining > 0
RETURNING seats_remaining
```

The `WHERE` is evaluated inside the row lock that the UPDATE itself takes, so two concurrent transactions can't both observe `seats > 0` and both decrement. `RETURNING` tells the application which case it's in.

**Parallel-safe waitlist promotion.** The worker uses `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1` to grab the head of the waitlist. Multiple workers can run this concurrently without coordinating: if the row is locked, they skip to nothing instead of waiting, so no two workers ever promote the same student. The worker also re-checks `seats_remaining > 0` inside the locked transaction, so retried jobs no-op cleanly.

## Load test

```
$ npm run loadtest
Load test: 500 concurrent requests, 10 seats
Section created: bef8901c-d6ad-4b9f-b75b-6cfcfecb48cb
Completed in 219ms (2283 req/s)
Server said enrolled: 10
DB enrollments:       10
PASS: 10 students enrolled, 490 waitlisted, no oversubscription.
```

The test fires 500 concurrent enrollment requests with unique student IDs against a 10-seat section, then queries Postgres directly to confirm exactly 10 enrollments exist and the response counts match. Throughput is a single-machine number — useful for proving the design produces the only correct outcome under contention, not as a production capacity claim.

## Known limitations

- **At-most-once event delivery.** Post-commit `publishEvent` calls can drop events if the process crashes between commit and publish. The fix is the transactional outbox pattern; handlers are already idempotent (`ON CONFLICT DO NOTHING`).
- **No idempotency keys on `/enroll`.** A double-tap with a slow network can produce a confusing 409 on the second request. Stripe-style idempotency keys would fix it.
- **No auth.** Both services trust the `studentId` in the request body.
- **Single-row contention ceiling.** Throughput on a popular section is bounded by lock contention on its row. Sufficient for a typical university; sharding would be needed beyond that.

## Running locally

Requires Postgres and Redis on default ports.

```
createuser -s postgresuser
createdb -O postgresuser course_service_db
createdb -O postgresuser enrollment_service_db

cd services/course-service && npm install && npm run migrate:up
cd ../enrollment-service && npm install && npm run migrate:up
```

Three terminals:

```
cd services/course-service && npm start          # terminal 1
cd services/enrollment-service && npm start      # terminal 2
cd services/enrollment-service && npm run worker # terminal 3
```

## Stack

Node, Fastify, Postgres, Redis (pub/sub + BullMQ), `node-pg-migrate`.