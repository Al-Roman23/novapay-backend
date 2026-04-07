import * as service from "../services/transaction.service";

export const createTransactionHandler = async (c: any) => {
    try {
        const body = await c.req.json();

        // Initiating Hardened Service Transaction Creation Logic
        const transaction = await service.createTransaction(body);

        return c.json(transaction);
    } catch (error: any) {
        // Mapping Internal Validation Failures To Professional HTTP 400 Status
        return c.json({
            error: "Transaction Validation Failure",
            message: error.message
        }, 400);
    }
};

export const getTransactionHandler = async (c: any) => {
    const id = c.req.param("id");
    const walletId = c.req.query("walletId");

    // Scenario: Individual ID Lookup
    if (id) {
        const transaction = await service.getTransaction(id);
        return c.json(transaction);
    }

    // Scenario: History Search With Enforced Pagination Control
    if (walletId) {
        const limit = Math.min(Number(c.req.query("limit") || 50), 100);
        const offset = Number(c.req.query("offset") || 0);

        const history = await service.getTransactionHistory(walletId, limit, offset);
        return c.json(history);
    }

    return c.json({ error: "Missing ID Or WalletID For Search Query" }, 400);
};

export const getTransactionMetricsHandler = async (c: any) => {
    try {
        // Retrieving High-Hardened Distributed Performance Metrics
        const metrics = await service.getTransactionMetrics();

        return c.json(metrics);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
};
