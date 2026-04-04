import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
    return c.text("NovaPay API Gateway!");
});

serve({
    fetch: app.fetch,
    port: 3000
});
