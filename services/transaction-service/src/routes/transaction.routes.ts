import { Hono } from "hono";

import {
    createTransactionHandler,
    getTransactionHandler
} from "../controllers/transaction.controller";

const app = new Hono();

app.post("/", createTransactionHandler);
app.get("/history", getTransactionHandler); // This Is Shared With Specific Search Logic
app.get("/:id", getTransactionHandler);

export default app;
