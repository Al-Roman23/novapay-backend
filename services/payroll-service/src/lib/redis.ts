import "dotenv/config";
import { Redis } from "ioredis";

// Log Redis Connection Details To Verify Docker Environment Integrity
console.log(`[PAYROLL] Connecting to Redis at: ${process.env.REDIS_URL || "fallback:redis:6379"}`);

// Use Explicit Host Resolution For Docker Internal Network Stability
export const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
});

redis.on("connect", () => console.log("[PAYROLL] Successfully Connected To Redis!"));
redis.on("error", (err) => console.error("[PAYROLL] Redis Connection Error:", err.message));
