import { Hono } from "hono";

const transactions = new Hono();

transactions.get("/", (c) => {
    return c.json({
        message: "Transactions Route Working!"
    });
});

export default transactions;
