import { Hono } from "hono";
import { prisma } from "../prisma";

const app = new Hono();

app.post("/", async (c) => {
    const body = await c.req.json();

    const account = await prisma.account.create({
        data: {
            userId: body.userId,
        },
    });

    return c.json(account);
});

export default app;
