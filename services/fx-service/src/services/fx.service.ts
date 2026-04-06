import * as repository from "../repositories/fx.repository";

// Supported Currency Pairs For The Mock FX Provider
const SUPPORTED_RATES: Record<string, number> = {
    "USD:BDT": 123,
    "USD:EUR": 0.95,
    "EUR:USD": 1.05,
    "BDT:USD": 0.0081,
};

export const createQuote = async (
    fromCurrency: string,
    toCurrency: string
) => {
    // Fetch Rate — Will Throw If Provider Is Down Or Pair Is Unsupported
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

    // Calculate Remaining Validity Window So Client Can Act Promptly
    const secondsRemaining = Math.max(
        0,
        Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000)
    );

    return {
        ...quote,
        secondsRemaining
    };
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

    if (new Date() > quote.expiresAt) {
        throw new Error("Quote Expired Before Use — Possible Crash Recovery Scenario!");
    }

    return repository.markUsed(id);
};

// Fetch Rate From Provider — Throws On Downtime Or Unsupported Pair
const fetchRate = async (
    from: string,
    to: string
): Promise<number> => {

    // Simulate FX Provider Downtime For Checkpoint 3 Test Scenario
    if (process.env.FX_PROVIDER_DOWN === "true") {
        throw new Error(
            "FX Provider Unavailable! Cannot Fetch Rate — Refusing To Apply Stale Or Default Rate."
        );
    }

    // Same Currency Pair Needs No External Rate Lookup
    if (from === to) {
        return 1;
    }

    const key = `${from}:${to}`;
    const rate = SUPPORTED_RATES[key];

    // Never Silently Apply A Default Rate For Unsupported Currency Pairs
    if (rate === undefined) {
        throw new Error(
            `FX Provider Does Not Support The ${from} → ${to} Pair. Please Contact Support.`
        );
    }

    return rate;
};
