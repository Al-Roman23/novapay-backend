import axios from "axios";

// Access Service URLs From Environment Variables With Docker Hostnames As Fallbacks
const ACCOUNT_SERVICE_URL =
    process.env.ACCOUNT_SERVICE_URL || "http://account-service:3001";

const TRANSACTION_SERVICE_URL =
    process.env.TRANSACTION_SERVICE_URL || "http://transaction-service:3002";

const LEDGER_SERVICE_URL =
    process.env.LEDGER_SERVICE_URL || "http://ledger-service:3003";

const FX_SERVICE_URL =
    process.env.FX_SERVICE_URL || "http://fx-service:3006";

const PAYROLL_SERVICE_URL =
    process.env.PAYROLL_SERVICE_URL || "http://payroll-service:3005";

const ADMIN_SERVICE_URL =
    process.env.ADMIN_SERVICE_URL || "http://admin-service:3007";

// Retrieve Current Health Status Of All Six Microservices
export const getSystemHealth = async () => {
    // Perform Parallel Health Checks Across Entire Internal Network
    const checks = await Promise.allSettled([
        axios.get(`${ACCOUNT_SERVICE_URL}/`),
        axios.get(`${TRANSACTION_SERVICE_URL}/`),
        axios.get(`${LEDGER_SERVICE_URL}/`),
        axios.get(`${FX_SERVICE_URL}/`),
        axios.get(`${PAYROLL_SERVICE_URL}/`),
        axios.get(`${ADMIN_SERVICE_URL}/`)
    ]);

    const [account, transaction, ledger, fx, payroll, admin] = checks;

    return {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
            "account-service": account.status === "fulfilled" ? "up" : "down",
            "transaction-service": transaction.status === "fulfilled" ? "up" : "down",
            "ledger-service": ledger.status === "fulfilled" ? "up" : "down",
            "fx-service": fx.status === "fulfilled" ? "up" : "down",
            "payroll-service": payroll.status === "fulfilled" ? "up" : "down",
            "admin-service": admin.status === "fulfilled" ? "up" : "down"
        }
    };
};

// Perform A Global Invariant Check Across The Ledger Service
export const checkLedgerInvariant = async () => {
    try {
        const response = await axios.get(
            `${LEDGER_SERVICE_URL}/invariant`
        );

        return response.data;

    } catch (error: any) {
        throw new Error(
            `Ledger Invariant Check Failed: ${error.message}!`
        );
    }
};

// Orchestrating Global Financial Performance Aggregation For Board Presentation
export const getBusinessMetrics = async () => {
    try {
        // Fetching Real-Time Analytical Data From The Transaction Refinery
        const response = await axios.get(
            `${TRANSACTION_SERVICE_URL}/metrics/stats`
        );

        return response.data;

    } catch (error: any) {
        throw new Error(
            `Business Metrics Extraction Crisis: ${error.message}!`
        );
    }
};
