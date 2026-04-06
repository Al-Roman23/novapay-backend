import { describe, it, expect, vi, beforeEach } from "vitest";
import * as repository from "../ledger.repository";
import { prisma } from "../../lib/prisma";

// Mocking The Prisma Module For Ledger Domain Operations
vi.mock("../../lib/prisma", () => ({
    prisma: {
        ledgerEntry: {
            findMany: vi.fn()
        }
    }
}));

describe("Ledger Invariant Verification Logic", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Should Correctly Return Balanced For A Valid Cross-Currency Transfer Using FromAmount", async () => {
        const mockEntries = [
            { type: "DEBIT", amount: 100, fromAmount: null },  // USD Debit
            { type: "CREDIT", amount: 12300, fromAmount: 100 } // BDT Credit Corrected To 100 USD
        ];

        // Mocking Ledger Entry Data Retrieval
        (prisma.ledgerEntry.findMany as any).mockResolvedValue(mockEntries);

        const result = await repository.getLedgerInvariant();

        expect(result.isBalanced).toBe(true);
        expect(result.difference).toBe(0);
        expect(result.violationCount).toBe(0);
    });

    it("Should Detect An Imbalance If Debit And Credit Do Not Match In Source Currency", async () => {
        const mockEntries = [
            { type: "DEBIT", amount: 100, fromAmount: null },
            { type: "CREDIT", amount: 11000, fromAmount: 90 } // Gap Of 10 In Balanced Check
        ];

        (prisma.ledgerEntry.findMany as any).mockResolvedValue(mockEntries);

        const result = await repository.getLedgerInvariant();

        expect(result.isBalanced).toBe(false);
        expect(result.violationCount).toBe(1);
    });
});
