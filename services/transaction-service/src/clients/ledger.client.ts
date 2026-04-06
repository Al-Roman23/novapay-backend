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
    try {
        const response = await axios.post(
            `${LEDGER_SERVICE_URL}/entry`,
            data
        );

        return response.data;
    } catch (error: any) {
        // Extracting Descriptive Domain Failure Message From Remote Service Response
        const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Ledger Core Submission Failure";

        throw new Error(message);
    }
};

// Fetch All Ledger Entries Associated With A Specific Transaction ID
export const getLedgerEntries = async (transactionId: string) => {
    const response = await axios.get(
        `${LEDGER_SERVICE_URL}/entries/${transactionId}`
    );

    return response.data;
};
