import { prisma } from "@novapay/db";

export const findAllTransactions = async () => {
    return prisma.transaction.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};
