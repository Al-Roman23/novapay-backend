import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Account Service Running!");
});

serve({
    fetch: app.fetch,
    port: 3001
});
