import { Hono } from "hono";

import {
    createLedgerAccountHandler,
    createEntryHandler,
    getEntriesHandler,
    checkInvariantHandler
} from "../controllers/ledger.controller";

const app = new Hono();

app.post("/account", createLedgerAccountHandler);
app.post("/entry", createEntryHandler);
app.get("/entries/:transactionId", getEntriesHandler);
app.get("/invariant", checkInvariantHandler);

export default app;
