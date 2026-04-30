import { redisClient } from "../config/redis.js";
import { worker } from "./worker.js";

const start = async () => {
    try {
        await redisClient.connect();
        console.log("Redis publisher connected");
        console.log("Waitlist worker process started, awaiting jobs...");
    } catch (err) {
        console.error("Failed to start worker process:", err);
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    console.log(`Received ${signal}, closing worker gracefully...`);
    try {
        await worker.close();
        await redisClient.quit();
        console.log("Worker closed. Bye.");
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();