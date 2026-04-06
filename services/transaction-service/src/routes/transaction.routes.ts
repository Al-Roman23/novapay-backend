import { Hono } from "hono";

import {
    createTransactionHandler,
    getTransactionHandler
} from "../controllers/transaction.controller";

const app = new Hono();

app.post("/", createTransactionHandler);
app.get("/:id", getTransactionHandler);

export default app;
