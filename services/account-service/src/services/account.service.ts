import * as repository from "../repositories/account.repository";

export const createAccount = async (userId: string, currency: string) => {
    return repository.createAccount(userId, currency);
};

export const getAccount = async (id: string) => {
    return repository.getAccount(id);
};

export const createWallet = async (id: string, currency: string) => {
    return repository.createWallet(id, currency);
};

export const getWallets = async (id: string) => {
    return repository.getWallets(id);
};
