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
    if (data.toCurrency && data.toCurrency !== data.currency) {
        if (!data.quoteId) {
            throw new Error(
                "FX Quote Required For Cross-Currency Transfer!"
            );
        }
        await fxClient.validateQuote(data.quoteId);
    }

    // 1. Create Transaction
    const transaction = await createTransaction(data);

    if (!transaction) {
        throw new Error("Transaction Creation Failed!");
    }

    // 2. Mark Processing
    await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "PROCESSING" }
    });

    // 3. Debit Sender
    await createLedgerEntry({
        ledgerAccountId: data.fromWalletId,
        type: "DEBIT",
        amount: data.amount,
        transactionId: transaction.id
    });

    // 4. Credit Receiver
    await createLedgerEntry({
        ledgerAccountId: data.toWalletId,
        type: "CREDIT",
        amount: data.amount,
        transactionId: transaction.id
    });

    // 5. Mark Completed
    const completedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" }
    });

    // 6. Mark FX Quote As Used (Prevents Reuse Across Transfers)
    if (data.quoteId) {
        await fxClient.markQuoteUsed(data.quoteId);
    }

    return completedTransaction;
};
