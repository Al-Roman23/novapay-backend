import { Queue } from "bullmq";
import { redis } from "../lib/redis";

export const payrollQueue = new Queue("payroll", {
    connection: redis,
});
