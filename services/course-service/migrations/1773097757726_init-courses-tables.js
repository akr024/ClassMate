
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

};


export const down = (pgm) => {};
