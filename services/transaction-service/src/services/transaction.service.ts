import * as repository from "../repositories/transaction.repository";

// Note: FX Quote Validation And markQuoteUsed Are Handled In transfer.service.ts
// After Both Ledger Legs Are Confirmed — Do NOT Call markQuoteUsed Here

export const createTransaction = async (data: any) => {
    return repository.createTransaction(data);
};

export const getTransaction = async (id: string) => {
    return repository.getTransaction(id);
};

// Providing Pagination Logic For Massive Dataset Extraction
export const getTransactionHistory = async (walletId: string, limit: number, offset: number) => {
    return repository.getTransactionHistory(walletId, limit, offset);
};

// Exposing High-Hardened Financial Performance Metrics For Operational Audit
export const getTransactionMetrics = async () => {
    return repository.getSummaryMetrics();
};
