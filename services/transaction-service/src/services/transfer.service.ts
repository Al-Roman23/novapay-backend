import { createTransaction } from "../repositories/transaction.repository";
import { createLedgerEntry } from "../clients/ledger.client";
import { prisma } from "../lib/prisma";
import * as fxClient from "./fx.client";

export const createTransfer = async (data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    currency: string;
    idempotencyKey: string;
    toCurrency?: string;
    quoteId?: string;
}) => {

    // Step 0. Validate FX Quote For Cross-Currency Transfers
    let fxMeta: any = undefined;

    if (data.toCurrency && data.toCurrency !== data.currency) {
        if (!data.quoteId) {
            throw new Error(
                "FX Quote Required For Cross-Currency Transfer!"
            );
        }
        const quote = await fxClient.validateQuote(data.quoteId);

        fxMeta = {
            rate: Number(quote.rate),
            fromAmount: data.amount,
            toAmount: data.amount * Number(quote.rate)
        };
    }

    // Step 1. Create Transaction (Or Fetch Existing For Idempotency Scenarios A, B, D, E)
    const transaction = await createTransaction({
        ...data,
        lockedRate: fxMeta?.rate,
        targetAmount: fxMeta?.toAmount
    });

    if (!transaction) {
        throw new Error("Transaction Creation Failed!");
    }

    // Scenario A + B: Same Key Returns Existing COMPLETED Record - Return Immediately To Avoid Duplicate Work
    if (transaction.status === "COMPLETED") {
        return transaction;
    }

    // Scenario C Recovery Path: If It Is Already PROCESSING, We Continue The Work To Ensure Eventual Completion
    // Note: We No Longer Return Early Here; Instead, We Proceed To Execute The Debit/Credit Steps Idempotently

    try {
        // Step 2. Mark As PROCESSING To Enable Crash Recovery Detection If Not Already Done
        if (transaction.status === "PENDING") {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "PROCESSING" }
            });
        }

        // Step 3. Debit Sender - First Leg Of The Double-Entry Pair
        await createLedgerEntry({
            ledgerAccountId: data.fromWalletId,
            type: "DEBIT",
            amount: data.amount,
            transactionId: transaction.id,
            fxMeta
        });

        // Step 4. Credit Receiver - Second Leg Of The Double-Entry Pair
        await createLedgerEntry({
            ledgerAccountId: data.toWalletId,
            type: "CREDIT",
            amount: fxMeta ? fxMeta.toAmount : data.amount,
            transactionId: transaction.id,
            fxMeta
        });

        // Step 5. Mark COMPLETED - Both Legs Confirmed In The Ledger
        const completedTransaction = await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "COMPLETED" }
        });

        // Step 6. Mark FX Quote As Used To Prevent Any Quote Reuse Across Transfers
        if (data.quoteId) {
            await fxClient.markQuoteUsed(data.quoteId);
        }

        return completedTransaction;

    } catch (error: any) {
        console.error(`Critical Failure During Transfer ${transaction.id}:`, error.message);

        // Map Insufficient Funds Error To A FAILED Status For Clear Client Feedback
        if (error.message.includes("Insufficient") || error.response?.status === 402) {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" }
            });
        }

        // Re-Throw Error To Notify The Calling Service (e.g., Payroll Queue Worker)
        throw error;
    }
};
