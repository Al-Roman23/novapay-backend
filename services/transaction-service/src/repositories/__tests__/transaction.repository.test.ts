import crypto from "crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as repository from "../transaction.repository";
import { prisma } from "../../lib/prisma";

// Mocking The Prisma Module To Avoid Database Interaction During Unit Tests
vi.mock("../../lib/prisma", () => ({
    prisma: {
        transaction: {
            findFirst: vi.fn(),
            create: vi.fn()
        }
    }
}));

// Providing Standardized Hash Calculation Symmetric To Repository Logic
const computeRequestHash = (data: any) => {
    return crypto
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
};

describe("Transaction Repository Idempotency Logic", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockData = {
        fromWalletId: "wallet-a",
        toWalletId: "wallet-b",
        amount: 100,
        currency: "USD",
        idempotencyKey: "unique-key-123"
    };

    it("Scenario A: Should Return Existing Transaction If Valid Idempotency Key Exists", async () => {
        // Generating Symmetric Hash Signature For Mock Integrity Validation
        const requestHash = computeRequestHash(mockData);
        const existingTx = { ...mockData, id: "tx-123", requestHash };

        // Mocking Prisma Finding An Existing Transaction Within Expiry Window
        (prisma.transaction.findFirst as any).mockResolvedValue(existingTx);

        const result = await repository.createTransaction(mockData);

        expect(result).toEqual(existingTx);
        expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it("Scenario E: Should Throw Error If Idempotency Key Reused With Different Payload", async () => {
        const existingTx = { ...mockData, id: "tx-123", requestHash: "WRONG_HASH" };

        // Mocking Prisma Finding An Existing Transaction With A Tampered Hash Signature
        (prisma.transaction.findFirst as any).mockResolvedValue(existingTx);

        await expect(repository.createTransaction(mockData)).rejects.toThrow(
            "Idempotency Key Violation: Reused with different payload integrity!"
        );
    });

    it("Scenario New: Should Create A New Transaction If No Existing Record Found", async () => {
        // Mocking Prisma Returning No Match
        (prisma.transaction.findFirst as any).mockResolvedValue(null);
        (prisma.transaction.create as any).mockResolvedValue({ ...mockData, id: "new-tx" });

        const result = await repository.createTransaction(mockData);

        expect(result.id).toEqual("new-tx");
        expect(prisma.transaction.create).toHaveBeenCalled();
    });
});
