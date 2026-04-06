import { Hono } from "hono";
import {
    createPayroll,
    getPayroll
} from "../controllers/payroll.controller";

const app = new Hono();

app.post("/", createPayroll);
app.get("/:id", getPayroll);

export default app;
