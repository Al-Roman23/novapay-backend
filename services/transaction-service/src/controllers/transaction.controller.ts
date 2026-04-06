import * as service from "../services/transaction.service";

export const createTransactionHandler = async (c: any) => {
    const body = await c.req.json();

    const transaction = await service.createTransaction(body);

    return c.json(transaction);
};

export const getTransactionHandler = async (c: any) => {
    const id = c.req.param("id");

    const transaction = await service.getTransaction(id);

    return c.json(transaction);
};
