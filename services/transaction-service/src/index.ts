import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import transactions from "./routes/transactions";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Transaction Service Running!");
});

app.route("/transactions", transactions);

serve({
    fetch: app.fetch,
    port: 4002,
});

export default app;
