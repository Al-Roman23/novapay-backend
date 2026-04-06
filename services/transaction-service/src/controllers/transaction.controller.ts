import * as service from "../services/transaction.service";

export const createTransactionHandler = async (c: any) => {
    const body = await c.req.json();

    const transaction = await service.createTransaction(body);

    return c.json(transaction);
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
