export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable("sections", {
        id: {
            type: "uuid",
            primaryKey: true
        },
        course_id: {
            type: "uuid",
            notNull: true
        },
        section_number: {
            type: "integer",
            notNull: true
        },
        capacity: {
            type: "integer",
            notNull: true
        },
        seats_remaining: {
            type: "integer",
            notNull: true
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        }
    })

    pgm.createTable("enrollments", {
        id: {
            type: "uuid",
            primaryKey: true
        },
        student_id: {
            type: "uuid",
            notNull: true
        },
        section_id: {
            type: "uuid",
            notNull: true
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        }
    })

    pgm.addConstraint(
        "enrollments",
        "unique_student_section",
        "UNIQUE(student_id, section_id)"
    )
};

export const down = (pgm) => {
    pgm.dropTable("sections");
    pgm.dropTable("enrollments")
};
