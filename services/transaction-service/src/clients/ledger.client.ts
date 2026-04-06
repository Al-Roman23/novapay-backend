import axios from "axios";

// Access The Ledger Service URL From Environment Variables
const LEDGER_SERVICE_URL = process.env.LEDGER_SERVICE_URL!;

// Create A New Ledger Entry (Debit Or Credit)
export const createLedgerEntry = async (data: {
    ledgerAccountId: string;
    type: "DEBIT" | "CREDIT";
    amount: number;
    transactionId: string;
    fxMeta?: {
        rate: number;
        fromAmount: number;
        toAmount: number;
    }
}) => {
    const response = await axios.post(
        `${LEDGER_SERVICE_URL}/entry`,
        data
    );

    return response.data;
};

// Fetch All Ledger Entries Associated With A Specific Transaction ID
export const getLedgerEntries = async (transactionId: string) => {
    const response = await axios.get(
        `${LEDGER_SERVICE_URL}/entries/${transactionId}`
    );

    return response.data;
};
