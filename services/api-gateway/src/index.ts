import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { getAccountHealth } from "./services/account.service";

const app = new Hono();

app.get("/", (c) => {
    return c.text("NovaPay API Gateway!");
});

app.get("/accounts/health", async (c) => {
    const response = await getAccountHealth();
    return c.json({ service: "account", response });
});

serve({
    fetch: app.fetch,
    port: 3000
});
