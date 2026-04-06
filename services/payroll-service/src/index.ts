import "dotenv/config";
import { initTracing, observabilityMiddleware, registry } from "@novapay/observability";

// Bootstrapping Automated Disbursement Tracing For Total Operational Audit Integrity
initTracing("payroll-service");

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import payrollRoutes from "./routes/payroll.routes";

// Import Worker To Ensure Background Job Processing Starts Automatically
import "./workers/payroll.worker";

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

// Registering The Disbursement Router At The Primary Service Interface
app.route("/", payrollRoutes);

serve({
    fetch: app.fetch,
    port: 3005,
});
