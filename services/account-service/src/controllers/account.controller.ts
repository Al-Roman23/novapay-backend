import * as service from "../services/account.service";

export const createAccountHandler = async (c: any) => {
    try {
        const body = await c.req.json();

        // Accept userId As Primary Input For Field-Level Encrypted Account Creation
        const account = await service.createAccount(
            body.userId,
            body.currency || "USD"
        );

        return c.json(account, 201);
    } catch (error: any) {
        return c.json({ error: error.message || "Account Creation Failed!" }, 500);
    }
};

export const getAccountHandler = async (c: any) => {
    const id = c.req.param("id");

    const account = await service.getAccount(id);

    return c.json(account);
};

export const createWalletHandler = async (c: any) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const wallet = await service.createWallet(id, body.currency);

    return c.json(wallet);
};

export const getWalletsHandler = async (c: any) => {
    const id = c.req.param("id");

    const wallets = await service.getWallets(id);

    return c.json(wallets);
};
