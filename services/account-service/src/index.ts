import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import accounts from "./routes/accounts";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Account Service Running!");
});

app.route("/accounts", accounts);

serve({
    fetch: app.fetch,
    port: 3000,
});

export default app;
