import "dotenv/config";
import { initTracing, observabilityMiddleware, registry } from "@novapay/observability";

// Bootstrapping Distributed Performance Tracing Module For Operational Audit
initTracing("transaction-service");

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import transactionRoutes from "./routes/transaction.routes";
import transferRoutes from "./routes/transfer.routes";
import { recoveryWorker } from "./workers/recovery.worker";

const app = new Hono();

// Implementing Global Observability Middleware Layer For Performance Tracing
app.use("*", observabilityMiddleware);

// Exposing Scraping Endpoint For Prometheus Metrics Collection System
app.get("/metrics", async (c) => {
    return c.text(await registry.metrics());
});

app.get("/", (c) => {
    return c.text("Transaction Service Running!");
});

app.route("/transactions", transactionRoutes);
app.route("/", transferRoutes);

serve({
    fetch: app.fetch,
    port: 3002,
});

// Recovering Incomplete Transactions Using Background Worker Process
setInterval(() => {
    recoveryWorker();
}, 10000);
