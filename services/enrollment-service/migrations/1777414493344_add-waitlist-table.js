export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable("waitlist", {
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
        position: {
            type: "integer",
            notNull: true
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        }
    });

    // such that student can only appear on a given section's waitlist once
    pgm.addConstraint(
        "waitlist",
        "unique_student_section_waitlist",
        "UNIQUE(student_id, section_id)"
    );

    // to make the search for the FIFO student in a section
    pgm.createIndex("waitlist", ["section_id", "position"]);
};

export const down = (pgm) => {
    pgm.dropTable("waitlist");
};