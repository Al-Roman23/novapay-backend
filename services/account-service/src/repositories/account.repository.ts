import { prisma } from "../prisma";

export const createAccount = async (userId: string, currency: string) => {
    return prisma.account.create({
        data: {
            userId,
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
    return prisma.account.findUnique({
        where: { id },
        include: {
            wallets: true,
        },
    });
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
