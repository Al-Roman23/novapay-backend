import { Hono } from "hono";
import {
    getHealth,
    getLedgerInvariant,
    getBusinessMetricsHandler
} from "../controllers/admin.controller";

const router = new Hono();

// Exposing Global Oversight Endpoints For Technical Health And Financial Success
router.get("/health", getHealth);
router.get("/ledger-invariant", getLedgerInvariant);
router.get("/business-metrics", getBusinessMetricsHandler);

export default router;
