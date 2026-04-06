import { prisma } from "../lib/prisma";

// Create The Parent Payroll Job And Its Child Line Items
export const createPayroll = async (data: any) => {
    // Parse Input Items Supporting Multiple Key Formats
    const itemsData = data.items || data.disbursements || data.payments || data.users || [];
    const items = itemsData.map((p: any) => ({
        userId: p.userId,
        walletId: p.walletId,   // Employee Ledger Account ID To Credit
        amount: Number(p.amount),
        currency: p.currency || data.currency || "USD"
    }));

    // Calculate Total Amount From Items If Not Explicitly Provided
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);

    return prisma.payrollJob.create({
        data: {
            employerId: data.employerId,
            fromWalletId: data.fromWalletId, // Employer Ledger Account ID To Debit
            totalAmount: data.totalAmount || calculatedTotal,
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
