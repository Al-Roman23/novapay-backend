import axios from "axios";
import * as repo from "../repositories/payroll.repository";
import { payrollQueue } from "../queues/payroll.queue";
import { prisma } from "../lib/prisma";

// Create A New Payroll Job And Enqueue It For Asynchronous Processing
export const createPayroll = async (data: any) => {
    // Persist Initial Payroll Record To Database
    const job = await repo.createPayroll(data);

    // Add Job To Processing Queue With Employer-Specific Identification
    // Using A Consistent jobId Pattern Ensures We Do Not Process The Same Job Twice
    await payrollQueue.add(
        "process-payroll",
        {
            payrollId: job.id
        },
        {
            // Use Employer ID As Part Of Job ID To Simplify Manual Audit Trails
            jobId: `payroll-${job.employerId}-${job.id}`,
            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 2000
            }
        }
    );

    return job;
};

// Execute The Processing Of A Queued Payroll Job
export const processPayroll = async (data: any) => {
    // Retrieve Complete Payroll Data Including Line Items
    const payroll = await repo.getPayroll(data.payrollId);
    if (!payroll) return;

    // Mark Job Status As Processing In Database
    await prisma.payrollJob.update({
        where: { id: payroll.id },
        data: { status: "PROCESSING" }
    });

    // Iterate Through Every Employee Payment In The Job
    for (const item of payroll.items) {
        try {
            // Skip Successful Payments If This Job Is A Retry (Checkpoint Pattern)
            if (item.status === "COMPLETED") continue;

            // Mark Item As Processing
            await prisma.payrollItem.update({
                where: { id: item.id },
                data: { status: "PROCESSING" }
            });

            // Dispatch Domestic Transfer To Transaction Service
            // Using fromWalletId (employer ledger account) And item.walletId (employee ledger account)
            // The Idempotency Key Is Unique Per Job+Item So Retries Are Safe
            await axios.post(
                `${process.env.TRANSACTION_SERVICE_URL}/transfers/international`,
                {
                    fromWalletId: payroll.fromWalletId,  // Employer Ledger Account ID
                    toWalletId: item.walletId,             // Employee Ledger Account ID
                    amount: Number(item.amount),
                    currency: item.currency,
                    idempotencyKey: `payroll-${payroll.id}-item-${item.id}`
                }
            );

            // Mark Individual Item As Successfully Completed
            await prisma.payrollItem.update({
                where: { id: item.id },
                data: { status: "COMPLETED" }
            });

        } catch (error: any) {
            console.error(`Transfer Failed For Payroll Item ${item.id}:`, error.message);

            // Mark Individual Item Status As Failed
            await prisma.payrollItem.update({
                where: { id: item.id },
                data: { status: "FAILED" }
            });

            // Propagate Error To Trigger BullMQ Automatic Retry
            throw error;
        }
    }

    // Mark Global Payroll Job As Successfully Completed
    await prisma.payrollJob.update({
        where: { id: payroll.id },
        data: { status: "COMPLETED" }
    });
};

// Retrieve The Status And Details Of A Particular Payroll Job
export const getPayroll = async (id: string) => {
    return repo.getPayroll(id);
};
