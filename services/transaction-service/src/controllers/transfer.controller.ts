import { Context } from "hono";
import { createTransfer } from "../services/transfer.service";

export const createTransferHandler = async (c: Context) => {
    try {
        const body = await c.req.json();

        const transaction = await createTransfer({
            fromWalletId: body.fromWalletId,
            toWalletId: body.toWalletId,
            amount: body.amount,
            currency: body.currency,
            idempotencyKey: body.idempotencyKey,
            // Optional FX Fields For International Transfers
            toCurrency: body.toCurrency,
            quoteId: body.quoteId
        });

        return c.json(transaction);

    } catch (error: any) {
        // Logging The Full Error Hierarchy For Real-Time Trace Analysis Grid
        console.error(`Transfer Orchestration Crisis: ${error.message}`);

        // Scenario B: Handling Database Level Unique Constraint Violations For Race Conditions
        if (error.code === "P2002" || error.message?.includes("Unique constraint")) {
            return c.json({
                error: "Idempotency Conflict",
                message: "Another request with the same idempotency key is already in progress or completed."
            }, 409);
        }

        // Fulfilling Hardening Requirement: Pass Through Upstream Validation Errors (400/402/404)
        const status = error.status || error.response?.status || 500;
        return c.json({
            error: "Transfer Settlement Failure",
            message: error.message || "An internal error occurred during orchestration."
        }, status);
    }
};
