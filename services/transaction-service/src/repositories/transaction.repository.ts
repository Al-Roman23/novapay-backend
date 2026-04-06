import { prisma } from "../lib/prisma";
import crypto from "crypto";

export const createTransaction = async (data: any) => {
    // Create Request Hash
    const requestHash = crypto
        .createHash("sha256")
        .update(
            JSON.stringify({
                fromWalletId: data.fromWalletId,
                toWalletId: data.toWalletId,
                amount: data.amount,
                currency: data.currency,
                toCurrency: data.toCurrency, // Include For Scenario E
                quoteId: data.quoteId        // Include For Scenario E
            })
        )
        .digest("hex");

    // Check Existing Valid Transaction
    const existing = await prisma.transaction.findFirst({
        where: {
            idempotencyKey: data.idempotencyKey,
            idempotencyExpiresAt: {
                gt: new Date()
            }
        }
    });

    // If Exists - Compare Hash
    if (existing) {
        if (existing.requestHash !== requestHash) {
            throw new Error(
                "Idempotency key reused with different payload!"
            );
        }
        return existing;
    }

    // Create New Transaction
    return prisma.transaction.create({
        data: {
            fromWalletId: data.fromWalletId,
            toWalletId: data.toWalletId,
            amount: data.amount,
            currency: data.currency,
            toCurrency: data.toCurrency,
            quoteId: data.quoteId,
            idempotencyKey: data.idempotencyKey,
            requestHash,
            idempotencyExpiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            ),
            status: "PENDING"
        }
    });
};

export const getTransaction = async (id: string) => {
    return prisma.transaction.findUnique({
        where: { id }
    });
};
