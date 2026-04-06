import { prisma } from "../lib/prisma";
import { encrypt, decrypt } from "@novapay/encryption";
import crypto from "crypto";

export const createLedgerAccount = async (
    walletId: string,
    currency: string
) => {
    // Encrypt The Sensitive Wallet ID Before Saving To Database
    const { data: encryptedWalletId, iv: walletIdIv, dek: walletIdDek, dekIv: walletIdDekIv } = encrypt(walletId);

    const account = await prisma.ledgerAccount.create({
        data: {
            encryptedWalletId,
            walletIdIv,
            walletIdDek,
            walletIdDekIv,
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
    ledgerAccountId: string,
    type: "DEBIT" | "CREDIT",
    amount: number,
    transactionId: string
) => {
    // Retrieve The Latest Ledger Entry To Maintain The Hashing Chain Integrity
    const lastEntry = await prisma.ledgerEntry.findFirst({
        orderBy: { createdAt: "desc" }
    });

    const previousHash = lastEntry ? lastEntry.hash : "GENESIS_HASH";

    // Generating SHA256 Signature For The Current Record Based On Previous State
    const hash = crypto
        .createHash("sha256")
        .update(`${previousHash}${ledgerAccountId}${type}${amount}${transactionId}`)
        .digest("hex");

    return prisma.ledgerEntry.create({
        data: {
            ledgerAccountId,
            type,
            amount,
            transactionId,
            previousHash,
            hash
        },
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
    // Calculate The Sum Of All Entries Grouped By Type
    const groupedEntries = await prisma.ledgerEntry.groupBy({
        by: ["type"],
        _sum: {
            amount: true
        }
    });

    let totalDebit = 0;
    let totalCredit = 0;

    groupedEntries.forEach((group) => {
        if (group.type === "DEBIT") totalDebit = Number(group._sum.amount || 0);
        if (group.type === "CREDIT") totalCredit = Number(group._sum.amount || 0);
    });

    // An Invariant Violation Occurs If Debits And Credits Do Not Perfectly Balance
    const isBalanced = totalDebit === totalCredit;
    const difference = Math.abs(totalDebit - totalCredit);
    const violationCount = isBalanced ? 0 : 1;

    return {
        isBalanced,
        totalDebit,
        totalCredit,
        difference,
        violationCount
    };
};
