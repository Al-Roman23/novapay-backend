import { Hono } from "hono";
import {
    getHealth,
    getLedgerInvariant
} from "../controllers/admin.controller";

const router = new Hono();

router.get("/health", getHealth);
router.get("/ledger-invariant", getLedgerInvariant);

export default router;
