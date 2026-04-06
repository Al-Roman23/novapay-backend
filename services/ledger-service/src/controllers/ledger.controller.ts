import * as service from "../services/ledger.service";

export const createLedgerAccountHandler = async (c: any) => {
    const body = await c.req.json();

    const account = await service.createLedgerAccount(
        body.walletId,
        body.currency
    );

    return c.json(account);
};

export const createEntryHandler = async (c: any) => {
    try {
        const body = await c.req.json();

        // Fulfilling Hardening Requirement: Atomic Orchestration Of Multi-Service High Fidelity Payloads
        const entry = await service.createEntryAtomic(body);

        return c.json(entry);
    } catch (error: any) {
        // Mapping Domain Logic Failures To Professional HTTP 400 Status
        return c.json({
            error: "Ledger Entry Rejection",
            message: error.message
        }, 400);
    }
};

export const getEntriesHandler = async (c: any) => {
    const transactionId = c.req.param("transactionId");

    const entries = await service.getEntries(transactionId);

    return c.json(entries);
};

export const checkInvariantHandler = async (c: any) => {
    try {
        const result = await service.checkLedgerInvariant();
        return c.json(result);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
};
