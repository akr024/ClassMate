import dotenv from "dotenv"

dotenv.config()

export const config = {
    port: process.env.PORT || 3001,

    postgres: {
        host: process.env.POSTGRES_HOST || "localhost",
        port: process.env.POSTGRES_PORT || 5432,
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POST_PASSWORD || "postgres",
        database: process.env.POSTGRES || "course_service_db"
    }
}