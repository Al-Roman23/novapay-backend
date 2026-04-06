import * as repository from "../repositories/transaction.repository";
import * as fxClient from "./fx.client";

export const createTransaction = async (data: any) => {
    if (data.fromCurrency !== data.toCurrency) {

        if (!data.quoteId) {
            throw new Error(
                "FX Quote required for cross currency transfer!"
            );
        }

        await fxClient.validateQuote(data.quoteId);
    }

    if (data.quoteId) {
        await fxClient.markQuoteUsed(data.quoteId);
    }

    return repository.createTransaction(data);
};

export const getTransaction = async (id: string) => {
    return repository.getTransaction(id);
};
