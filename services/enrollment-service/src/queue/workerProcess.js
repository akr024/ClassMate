import { worker } from "./worker.js";

console.log("Waitlist worker process started, awaiting jobs...");

const shutdown = async (signal) => {
    console.log(`Received ${signal}, closing worker gracefully...`);
    try {
        await worker.close();
        console.log("Worker closed. Bye.");
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));