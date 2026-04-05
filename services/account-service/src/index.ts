import "dotenv/config";
import { Hono } from "hono";
import accounts from "./routes/accounts";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Account Service Running!");
});

app.route("/accounts", accounts);

export default app;
