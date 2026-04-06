import { prisma } from "../lib/prisma";

export const createQuote = async (
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    expiresAt: Date
) => {

    return prisma.fXQuote.create({
        data: {
            fromCurrency,
            toCurrency,
            rate,
            expiresAt
        }
    });
};

export const getQuote = async (id: string) => {

    return prisma.fXQuote.findUnique({
        where: {
            id
        }
    });
};

export const markUsed = async (id: string) => {

    return prisma.fXQuote.update({
        where: {
            id
        },
        data: {
            used: true
        }
    });
};
