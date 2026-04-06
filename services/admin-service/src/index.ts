import "dotenv/config";
import { initTracing, observabilityMiddleware, registry } from "@novapay/observability";

// Bootstrapping Global Oversight Tracing Module For High Integrity Operations
initTracing("admin-service");

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import adminRoutes from "./routes/admin.routes";

const app = new Hono();

// Global Request Tracing Infrastructure Integrated For Complete Observability
app.use("*", observabilityMiddleware);

// Exposing Scraping Path For Centralised Prometheus Metrics Ingestion
app.get("/metrics", async (c) => {
    return c.text(await registry.metrics());
});

app.get("/", (c) => {
    return c.text("Admin Service Running!");
});

app.route("/admin", adminRoutes);

serve({
    fetch: app.fetch,
    port: 3007,
});

export default app;
