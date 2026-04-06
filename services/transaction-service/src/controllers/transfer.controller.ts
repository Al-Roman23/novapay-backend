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
        console.error(error);

        // Scenario B: Handling Database Level Unique Constraint Violations For Race Conditions
        if (error.code === "P2002" || error.message?.includes("Unique constraint")) {
            return c.json({ 
                error: "Another request with the same idempotency key is already in progress or completed." 
            }, 409);
        }

        return c.json({ error: error.message || "Transfer Failed!" }, 500);
    }
};
