import * as repository from "../repositories/ledger.repository";
import { ledger_invariant_violation_count } from "@novapay/observability";

export const createLedgerAccount = async (
    walletId: string,
    currency: string
) => {
    return repository.createLedgerAccount(walletId, currency);
};

export const createEntryAtomic = async (data: any) => {
    // Fulfilling Hardening Requirement: Detect If Payload Is Single-Entry Or Double-Entry
    const isDoubleEntry = data.fromWalletId && data.toWalletId;

    if (isDoubleEntry) {
        // Orchestrating Balanced Settlement Pair Via Isolated Transaction
        return repository.createDoubleEntry({
            fromWalletId: data.fromWalletId,
            toWalletId: data.toWalletId,
            amount: Number(data.amount),
            currency: data.currency,
            transactionId: data.transactionId,
            fxMeta: data.fxMeta
        });
    }

    // Defaulting To Single-Entry Pattern For Legacy Or Internal Orchestration
    return repository.createEntry(
        data.ledgerAccountId,
        data.type,
        Number(data.amount),
        data.transactionId,
        data.fxMeta
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
