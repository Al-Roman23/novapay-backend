import { Hono } from "hono";
import { createTransferHandler } from "../controllers/transfer.controller";

const transferRoutes = new Hono();

transferRoutes.post("/transfers/international", createTransferHandler);

export default transferRoutes;
