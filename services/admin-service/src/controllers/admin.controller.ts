import { Context } from "hono";
import {
    getSystemHealth,
    checkLedgerInvariant
} from "../services/admin.service";

export const getHealth = async (c: Context) => {
    try {
        const health = await getSystemHealth();

        return c.json(health);

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
};

export const getLedgerInvariant = async (c: Context) => {
    try {
        const result = await checkLedgerInvariant();

        return c.json(result);

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
};
