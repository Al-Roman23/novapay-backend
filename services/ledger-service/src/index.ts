import "dotenv/config";
import { initTracing, observabilityMiddleware, registry } from "@novapay/observability";

// Initializing Distributed Financial Invariant Monitoring For Total Compliance
initTracing("ledger-service");

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import ledgerRoutes from "./routes/ledger.routes";

const app = new Hono();

// Global Request Tracing Middleware Integrated For Complete Visibility
app.use("*", observabilityMiddleware);

// Exposing Service Metrics Scraping Gateway For Ingestion Network
app.get("/metrics", async (c) => {
    return c.text(await registry.metrics());
});

app.get("/", (c) => {
    return c.text("Ledger Service Running!");
});

app.route("/ledger", ledgerRoutes);

serve({
    fetch: app.fetch,
    port: 3003,
});
