import { prisma } from "../lib/prisma";
import { createLedgerEntry, getLedgerEntries } from "../clients/ledger.client";

// Scan And Process System Failures Where Transactions Are Stuck
export const recoveryWorker = async () => {
    console.log("Analyzing Stuck Transactions...");

    // Identify Transactions Left In Processing State After A Crash Or Timeout
    const stuckTransactions = await prisma.transaction.findMany({
        where: {
            status: "PROCESSING"
        }
    });

    for (const transaction of stuckTransactions) {
        try {
            console.log("Attempting Recovery For Transaction:", transaction.id);

            // Fetch Current Ledger Entries To Determine The Exact Failure Point
            const entries = await getLedgerEntries(transaction.id);
            const hasDebit = entries.some((e: any) => e.type === "DEBIT");
            const hasCredit = entries.some((e: any) => e.type === "CREDIT");

            // Perform The Missing Leg Of The Double-Entry Movement Idempotently
            if (!hasDebit) {
                await createLedgerEntry({
                    ledgerAccountId: transaction.fromWalletId,
                    type: "DEBIT",
                    amount: Number(transaction.amount),
                    transactionId: transaction.id
                });
            }

            if (!hasCredit) {
                await createLedgerEntry({
                    ledgerAccountId: transaction.toWalletId,
                    type: "CREDIT",
                    amount: Number(transaction.amount),
                    transactionId: transaction.id
                });
            }

            // Finalize The Transaction Status Once Both Legs Are Verified
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "COMPLETED" }
            });

            console.log("Successfully Recovered Transaction:", transaction.id);

        } catch (error) {
            console.error("Critical Failure During Recovery For:", transaction.id);
        }
    }
};
