import "dotenv/config";
import { initTracing, observabilityMiddleware, registry } from "@novapay/observability";

// Bootstrapping Automated Disbursement Tracing For Total Operational Audit Integrity
initTracing("payroll-service");

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import payrollRoutes from "./routes/payroll.routes";

const app = new Hono();

// Global Observability Middleware For Tracing Payroll Lifecycle Execution
app.use("*", observabilityMiddleware);

// Service Performance Metrics Resource For Operational Dashboard Ingestion
app.get("/metrics", async (c) => {
    return c.text(await registry.metrics());
});

app.get("/", (c) => {
    return c.text("Payroll Service Running!");
});

app.route("/payroll", payrollRoutes);

serve({
    fetch: app.fetch,
    port: 3005,
});
