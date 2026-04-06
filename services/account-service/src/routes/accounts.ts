import { Hono } from "hono";
import {
    createAccountHandler,
    getAccountHandler,
    createWalletHandler,
    getWalletsHandler
} from "../controllers/account.controller";

const app = new Hono();

app.post("/account", createAccountHandler);

app.get("/:id", getAccountHandler);

app.get("/:id/wallets", getWalletsHandler);

app.post("/:id/wallets", createWalletHandler);

export default app;
