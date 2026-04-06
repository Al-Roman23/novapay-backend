import { prisma } from "../lib/prisma";
import { encrypt, decrypt } from "@novapay/encryption";

export const createAccount = async (userId: string, currency: string) => {
    // Encrypt The Sensitive User ID Before Saving To Database
    const { data: encryptedUserId, iv: userIdIv, dek: userIdDek, dekIv: userIdDekIv } = encrypt(userId);

    return prisma.account.create({
        data: {
            encryptedUserId,
            userIdIv,
            userIdDek,
            userIdDekIv,
            wallets: {
                create: {
                    currency,
                },
            },
        },
        include: {
            wallets: true,
        },
    });
};

export const getAccount = async (id: string) => {
    const account = await prisma.account.findUnique({
        where: { id },
        include: {
            wallets: true,
        },
    });

    if (!account) return null;

    // Decrypt The User ID Transparently For The Service Layer
    const decryptedUserId = decrypt({
        data: account.encryptedUserId,
        iv: account.userIdIv,
        dek: account.userIdDek,
        dekIv: account.userIdDekIv
    });

    return {
        ...account,
        userId: decryptedUserId // Map It Back To Expected Property Name
    };
};

export const createWallet = async (accountId: string, currency: string) => {
    return prisma.wallet.create({
        data: {
            accountId,
            currency,
        },
    });
};

export const getWallets = async (accountId: string) => {
    return prisma.wallet.findMany({
        where: {
            accountId,
        },
    });
};
