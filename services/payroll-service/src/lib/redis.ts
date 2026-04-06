import "dotenv/config";
import { Redis } from "ioredis";

// Use Redis Host From Environment Variable Or Fallback To Localhost For Local Development
const REDIS_HOST = process.env.REDIS_HOST || "localhost";

export const redis = new Redis({
    host: REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
});
