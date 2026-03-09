
export const shorthands = undefined;


export const up = (pgm) => {
    pgm.createTable("courses", {
        id: {
            type: "uuid",
            primaryKey: true
        },
        courseCode: {
            type: "varchar(20)",
            notNull: true,
            unique: true
        },
        name: {
            type: "text",
            notNull: true
        },
        description: {
            type: "text"
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        }
    })

    pgm.createTable("sections", {
        id: {
            type: "uuid",
            primaryKey: true
        },
        course_id: {
            type: "uuid",
            notNull: true,
            references: "courses",
            onDelete: "cascade"
        },
        section_number: {
            type: "integer",
            notNull: true
        },
        capacity: {
            type: "integer",
            notNull: true
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        }
    })
};


export const down = (pgm) => {
    pgm.dropTable("courses")
    pgm.dropTable("sections")
};
