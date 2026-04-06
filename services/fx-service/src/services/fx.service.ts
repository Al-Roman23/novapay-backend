import * as repository from "../repositories/fx.repository";

export const createQuote = async (
    fromCurrency: string,
    toCurrency: string
) => {

    const rate = await fetchRate(fromCurrency, toCurrency);

    const expiresAt = new Date(Date.now() + 60 * 1000);

    return repository.createQuote(
        fromCurrency,
        toCurrency,
        rate,
        expiresAt
    );
};

export const getQuote = async (id: string) => {

    const quote = await repository.getQuote(id);

    if (!quote) {
        throw new Error("Quote Not Found!");
    }

    if (quote.used) {
        throw new Error("Quote Already Used!");
    }

    if (new Date() > quote.expiresAt) {
        throw new Error("Quote Expired!");
    }

    return quote;
};

// Update Quote Status To Prevent Reuse
export const markQuoteUsed = async (id: string) => {
    const quote = await repository.getQuote(id);

    if (!quote) {
        throw new Error("Quote Not Found!");
    }

    if (quote.used) {
        throw new Error("Quote Already Used!");
    }

    return repository.markUsed(id);
};

const fetchRate = async (
    from: string,
    to: string
) => {

    // Mock FX Provider
    if (from === "USD" && to === "BDT") {
        return 123;
    }

    if (from === "USD" && to === "EUR") {
        return 0.95;
    }

    return 1;
};
