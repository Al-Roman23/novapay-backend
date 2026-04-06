import { Hono } from "hono";
import { createTransferHandler } from "../controllers/transfer.controller";

const transferRoutes = new Hono();

transferRoutes.post("/transfer", createTransferHandler);

export default transferRoutes;
