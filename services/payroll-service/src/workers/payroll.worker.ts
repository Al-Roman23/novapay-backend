import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import { processPayroll } from "../services/payroll.service";

// Worker Process To Handle Background Payroll Disbursement Jobs
new Worker(
    "payroll",
    async (job) => {
        // Execute The Full Disbursement Logic For A Single Payroll Job
        await processPayroll(job.data);
    },
    {
        connection: redis,
        // Set Concurrency To One To Prevent Race Conditions During Disbursements
        concurrency: 1
    }
);
