import * as service from "../services/fx.service";

// Create A New FX Rate Quote With 60-Second TTL
export const createQuoteHandler = async (c: any) => {
    try {
        const body = await c.req.json();

        const quote = await service.createQuote(
            body.fromCurrency,
            body.toCurrency
        );

        return c.json(quote);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
};

// Validate A Quote And Return Details If Still Valid
export const getQuoteHandler = async (c: any) => {
    try {
        const id = c.req.param("id");

        const quote = await service.getQuote(id);

        return c.json(quote);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
};

// Handle Marking A Quote As Used To Prevent Double-Dipping
export const markQuoteUsedHandler = async (c: any) => {
    try {
        const id = c.req.param("id");

        const result = await service.markQuoteUsed(id);

        return c.json(result);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
};
