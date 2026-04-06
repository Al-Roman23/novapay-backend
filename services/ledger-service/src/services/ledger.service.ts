import * as repository from "../repositories/ledger.repository";
import { ledger_invariant_violation_count } from "@novapay/observability";

export const createLedgerAccount = async (
    walletId: string,
    currency: string
) => {
    return repository.createLedgerAccount(walletId, currency);
};

export const createEntry = async (
    ledgerAccountId: string,
    type: "DEBIT" | "CREDIT",
    amount: number,
    transactionId: string,
    fxMeta?: {
        rate: number;
        fromAmount: number;
        toAmount: number;
    }
) => {
    return repository.createEntry(
        ledgerAccountId,
        type,
        amount,
        transactionId,
        fxMeta
    );
};

export const getEntries = async (transactionId: string) => {
    return repository.getEntries(transactionId);
};

export const checkLedgerInvariant = async () => {
    const result = await repository.getLedgerInvariant();

    // Dynamically Updating Metric To Alert System If Data Inconsistency Is Found
    ledger_invariant_violation_count.labels("ledger-service").set(result.violationCount);

    return result;
};
