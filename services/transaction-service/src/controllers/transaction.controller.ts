import { getTransactions } from "../services/transaction.service";

export const getAllTransactions = async (c: any) => {
    const transactions = await getTransactions();
    return c.json(transactions);
};
