import dotenv from "dotenv"

dotenv.config()

export const config = {
    port: process.env.PORT || 3002,

    postgres: {
        host:process.env.POSTGRES_HOST || "localhost",
        port: process.env.POSTGRES_PORT || 5432,
        user: process.env.POSTGRES_USER || "postgresuser",
        password: process.env.POSTGRES_PASSWORD || "postgres",
        database: process.env.POSTGRES_DB || "enrollment_service_db"
    }
}