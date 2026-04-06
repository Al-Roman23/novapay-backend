import { prisma } from "../lib/prisma";
import crypto from "crypto";

export const createTransaction = async (data: any) => {
    // Fulfilling Hardening Requirement: Validate Absolute Minimum Schema Parity
    if (!data.idempotencyKey || !data.fromWalletId || !data.toWalletId) {
        throw new Error(
            "Missing Critical Transaction Headers: idempotencyKey, fromWalletId, and toWalletId are mandated."
        );
    }

    // Create Request Hash For Scenario E (Payload Hijacking Detection)
    const requestHash = crypto
        .createHash("sha256")
        .update(
            JSON.stringify({
                fromWalletId: data.fromWalletId,
                toWalletId: data.toWalletId,
                amount: data.amount,
                currency: data.currency,
                toCurrency: data.toCurrency,
                quoteId: data.quoteId,
                lockedRate: data.lockedRate,
                targetAmount: data.targetAmount
            })
        )
        .digest("hex");

    // Check Existing Valid Transaction (Scenario A Implementation)
    const existing = await prisma.transaction.findFirst({
        where: {
            idempotencyKey: data.idempotencyKey,
            idempotencyExpiresAt: {
                gt: new Date()
            }
        }
    });

    // If Exists - Compare Hash Integrity
    if (existing) {
        if (existing.requestHash !== requestHash) {
            throw new Error(
                "Idempotency Key Violation: Reused with different payload integrity!"
            );
        }
        return existing;
    }

    // Persisting New Transaction With Status PENDING
    return prisma.transaction.create({
        data: {
            fromWalletId: data.fromWalletId,
            toWalletId: data.toWalletId,
            amount: data.amount,
            currency: data.currency,
            toCurrency: data.toCurrency,
            quoteId: data.quoteId,
            lockedRate: data.lockedRate,
            targetAmount: data.targetAmount,
            idempotencyKey: data.idempotencyKey,
            requestHash,
            idempotencyExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: "PENDING"
        }
    });
};

export const getTransaction = async (id: string) => {
    return prisma.transaction.findUnique({
        where: { id }
    });
};

// Enforcing Pagination Constraints To Maintain Optimal Database Performance
export const getTransactionHistory = async (walletId: string, limit: number, offset: number) => {
    return prisma.transaction.findMany({
        where: {
            OR: [
                { fromWalletId: walletId },
                { toWalletId: walletId }
            ]
        },
        orderBy: {
            createdAt: "desc"
        },
        take: limit,
        skip: offset
    });
};
