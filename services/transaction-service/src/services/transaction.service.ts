import { findAllTransactions } from "../repositories/transaction.repository";

export const getTransactions = async () => {
    return findAllTransactions();
};
