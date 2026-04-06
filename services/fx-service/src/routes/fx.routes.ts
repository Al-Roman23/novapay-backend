import { Hono } from "hono";

import {
    createQuoteHandler,
    getQuoteHandler,
    markQuoteUsedHandler
} from "../controllers/fx.controller";

const app = new Hono();

app.post("/quote", createQuoteHandler);
app.get("/quote/:id", getQuoteHandler);

app.post("/quote/:id/use", markQuoteUsedHandler);

export default app;
