import { prisma } from "../lib/prisma";

// Create The Parent Payroll Job And Its Child Line Items
export const createPayroll = async (data: any) => {
    // Map The Incoming Payment Array To The Correct Database Model Fields
    const items = (data.payments || data.users).map((p: any) => ({
        userId: p.userId || p.walletId,
        amount: p.amount,
        currency: p.currency || "USD"
    }));

    return prisma.payrollJob.create({
        data: {
            employerId: data.employerId,
            totalAmount: data.totalAmount,
            totalUsers: items.length,
            items: {
                create: items
            }
        },
        include: {
            items: true
        }
    });
};

// Fetch A Job By ID Including All Individual Payments
export const getPayroll = async (id: string) => {
    return prisma.payrollJob.findUnique({
        where: { id },
        include: {
            items: true
        }
    });
};
