import "dotenv/config";
import { initTracing, observabilityMiddleware, registry } from "@novapay/observability";

// Initialising Distributed Tracing Before Any Dependency Loads
initTracing("account-service");

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import accounts from "./routes/accounts";

const app = new Hono();

// Attaching Observability Middleware For Global Request Tracing 
app.use("*", observabilityMiddleware);

// Exposing Metrics Resource For Prometheus Monitoring Dashboard
app.get("/metrics", async (c) => {
    return c.text(await registry.metrics());
});

app.get("/", (c) => {
    return c.text("Account Service Running!");
});

// Registering The Router Modules At The Centralised Logic Prefix
app.route("/", accounts);

serve({
    fetch: app.fetch,
    port: 3001,
});

export default app;
