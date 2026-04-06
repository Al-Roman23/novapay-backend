import "dotenv/config";
import { initTracing, observabilityMiddleware, registry } from "@novapay/observability";

// Establishing Global Price Lifecycle Tracing For Cross-Currency Operations Visibility
initTracing("fx-service");

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import fxRoutes from "./routes/fx.routes";

const app = new Hono();

// Attaching Observability Trace Layer For Cross-Service Transaction Graphing
app.use("*", observabilityMiddleware);

// Exposing Service Performance Metrics For Real-Time Analysis Interface
app.get("/metrics", async (c) => {
    return c.text(await registry.metrics());
});

app.get("/", (c) => {
    return c.text("FX Service Running!");
});

app.route("/fx", fxRoutes);

serve({
    fetch: app.fetch,
    port: 3006,
});

export default app;
