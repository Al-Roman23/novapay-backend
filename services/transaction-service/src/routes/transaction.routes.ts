import { Hono } from "hono";

import {
    createTransactionHandler,
    getTransactionHandler,
    getTransactionMetricsHandler
} from "../controllers/transaction.controller";

const app = new Hono();

// Exposing Service Metadata And Financial Summaries For Centralised Operational Audit
app.get("/metrics/stats", getTransactionMetricsHandler);
app.post("/", createTransactionHandler);
app.get("/history", getTransactionHandler); // This Is Shared With Specific Search Logic
app.get("/:id", getTransactionHandler);

export default app;
