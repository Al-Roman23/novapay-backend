import axios from "axios";

const FX_SERVICE_URL = process.env.FX_SERVICE_URL || "http://localhost:3006";

export const validateQuote = async (quoteId: string) => {
    try {
        const response = await axios.get(
            `${FX_SERVICE_URL}/fx/quote/${quoteId}`
        );

        return response.data;

    } catch (error: any) {
        // Expose The Real FX Service Error For Easier Debugging
        const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Invalid Or Expired FX Quote";

        throw new Error(message);
    }
};

export const markQuoteUsed = async (quoteId: string) => {

    await axios.post(
        `${FX_SERVICE_URL}/fx/quote/${quoteId}/use`
    );
};
