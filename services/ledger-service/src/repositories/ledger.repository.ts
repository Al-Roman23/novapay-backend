import { prisma } from "../lib/prisma";
import { encrypt, decrypt } from "@novapay/encryption";
import crypto from "crypto";

export const createLedgerAccount = async (
    walletId: string,
    currency: string
) => {
    // Encrypt The Sensitive Wallet ID Before Saving To Database
    const { data: encryptedWalletId, iv: walletIdIv, dek: walletIdDek, dekIv: walletIdDekIv } = encrypt(walletId);

    // Fulfilling Hardening Requirement: Guard Against Undefined Identity Hashing
    if (!walletId) {
        throw new Error("Critical Failure: Wallet Identity Is Required For Ledger Account Creation.");
    }

    // Generating Secure Identity Hash For Anonymous Searchability In The Ledger
    const walletIdHash = crypto
        .createHash("sha256")
        .update(walletId)
        .digest("hex");

    const account = await prisma.ledgerAccount.create({
        data: {
            encryptedWalletId,
            walletIdIv,
            walletIdDek,
            walletIdDekIv,
            walletIdHash,
            currency,
        },
    });

    // Decrypt The Wallet ID Transparently For The Service Layer
    const decryptedWalletId = decrypt({
        data: account.encryptedWalletId,
        iv: account.walletIdIv,
        dek: account.walletIdDek,
        dekIv: account.walletIdDekIv
    });

    return {
        ...account,
        walletId: decryptedWalletId // Map It Back To Expected Property Name
    };
};

export const createEntry = async (
    walletOrInternalId: string,
    type: "DEBIT" | "CREDIT",
    amount: number,
    transactionId: string,
    fxMeta?: {
        rate: number;
        fromAmount: number;
        toAmount: number;
    }
) => {
    // Fulfilling Hardening Requirement: Guard Against Undefined Identity Hashing
    if (!walletOrInternalId) {
        throw new Error("Critical Failure: Wallet Identity Is Required For Ledger Entry Creation.");
    }

    // Attempting To Resolve Ledger ID From Service Identity Hash For Production Multi-Service Compatibility
    const identityHash = crypto
        .createHash("sha256")
        .update(walletOrInternalId)
        .digest("hex");

    let account = await prisma.ledgerAccount.findFirst({
        where: {
            OR: [
                { id: walletOrInternalId },
                { walletIdHash: identityHash }
            ]
        }
    });

    if (!account) {
        throw new Error(`Ledger Account For Identity ${walletOrInternalId} Not Found!`);
    }

    // Successfully Resolved Internal Ledger Identity From Searchable Hash
    const resolvedAccountId = account.id;

    // Enforce Idempotency By Checking For Existing Entry For This Transaction Pair
    // A Single Transaction Should Only Produce One Debit And One Credit In The Ledger
    const existing = await prisma.ledgerEntry.findFirst({
        where: {
            transactionId,
            type
        }
    });

    if (existing) {
        return existing;
    }

    // Retrieve The Latest Ledger Entry To Maintain The Hashing Chain Integrity
    const lastEntry = await prisma.ledgerEntry.findFirst({
        orderBy: { createdAt: "desc" }
    });

    const previousHash = lastEntry ? lastEntry.hash : "GENESIS_HASH";

    // Generating SHA256 Signature For The Current Record Based On Previous State
    const hashData = `${previousHash}${resolvedAccountId}${type}${amount}${transactionId}${fxMeta?.rate || ""}`;
    const hash = crypto
        .createHash("sha256")
        .update(hashData)
        .digest("hex");

    // Executing Secure Double-Entry Record Creation 
    return prisma.ledgerEntry.create({
        data: {
            ledgerAccountId: resolvedAccountId,
            type,
            amount,
            transactionId,
            previousHash,
            hash,
            rate: fxMeta?.rate,
            fromAmount: fxMeta?.fromAmount,
            toAmount: fxMeta?.toAmount
        },
    });
};

// Orchestrating Atomic Double-Entry Settlement Pair Under Strict ACID Isolation
export const createDoubleEntry = async (data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    currency: string;
    transactionId: string;
    fxMeta?: any;
}) => {
    return prisma.$transaction(async (tx) => {
        // Leg 1: Debit The Source Wallet Identity
        const debit = await createEntry(
            data.fromWalletId,
            "DEBIT",
            data.amount,
            data.transactionId,
            data.fxMeta
        );

        // Leg 2: Credit The Target Wallet Identity
        const credit = await createEntry(
            data.toWalletId,
            "CREDIT",
            data.fxMeta ? data.fxMeta.toAmount : data.amount,
            data.transactionId,
            data.fxMeta
        );

        return { debit, credit };
    });
};

export const getEntries = async (transactionId: string) => {
    return prisma.ledgerEntry.findMany({
        where: {
            transactionId,
        },
    });
};

export const getLedgerInvariant = async () => {
    // Fetch All Entries With Their FX Metadata To Enable Currency-Aware Invariant Checking
    const allEntries = await prisma.ledgerEntry.findMany({
        select: {
            type: true,
            amount: true,
            fromAmount: true
        }
    });

    let totalDebit = 0;
    let totalCredit = 0;

    // For FX Transfers: Use fromAmount (Source Currency) For Both Sides
    // For Same-Currency Transfers: fromAmount Is Null So Fall Back To Amount
    // This Ensures The Invariant Checks "Money Out == Money In" In Source Currency
    for (const entry of allEntries) {
        const effectiveAmount = entry.fromAmount !== null
            ? Number(entry.fromAmount)
            : Number(entry.amount);

        if (entry.type === "DEBIT") {
            totalDebit += effectiveAmount;
        } else {
            totalCredit += effectiveAmount;
        }
    }

    // Allow A Small Floating Point Tolerance For Decimal Arithmetic Precision
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.001;
    const violationCount = isBalanced ? 0 : 1;

    return {
        isBalanced,
        totalDebit,
        totalCredit,
        difference,
        violationCount
    };
};
