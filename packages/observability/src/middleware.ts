// Universal Hono Middleware For NovaPay Observability

import { Context, Next } from "hono";
import { Logger, LogContext } from "./logger";
import { Counter, Histogram, Registry, Gauge } from "prom-client";

// Global Metrics Registry For Observability Services
const registry = new Registry();

// API Latency Histogram For P95/P99 Monitoring
const http_request_duration_seconds = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP Request Duration In Seconds",
    labelNames: ["method", "path", "status"],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [registry]
});

// Transaction Throughput Counter
const transaction_throughput_total = new Counter({
    name: "transaction_throughput_total",
    help: "Total Number Of Successful Transactions Processed",
    labelNames: ["service", "type"],
    registers: [registry]
});

// Critical Ledger Invariant Violation Metric For Data Integrity Monitoring
const ledger_invariant_violation_count = new Gauge({
    name: "ledger_invariant_violation_count",
    help: "Current Number Of Ledger Inconsistency Events Detected",
    labelNames: ["service"],
    registers: [registry]
});

// Create Global Logger Singleton Instance
const sharedLogger = new Logger("novapay-service");

export const observabilityMiddleware = async (c: Context, next: Next) => {
    // Generate Or Extract Request ID For Tracing
    const requestId = c.req.header("x-request-id") || Math.random().toString(36).substring(7);
    const userId = c.req.header("x-user-id") || "anonymous";
    const transactionId = c.req.header("x-transaction-id") || "N/A";

    const context: LogContext = {
        requestId,
        userId,
        transactionId
    };

    // Attach Context Values To Hono Environment For Clean Access
    c.set("logContext", context);
    c.set("logger", sharedLogger);

    const startTime = Date.now();
    const { method, url } = c.req;

    // Log The Incoming Request With Metadata
    sharedLogger.info(`Incoming Request: ${method} ${url}`, context);

    await next();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const status = c.res.status;

    // Record Duration In Prometheus Histogram
    http_request_duration_seconds.labels(method, c.req.path, status.toString()).observe(duration);

    // Logging The Final Result After Response Sending
    sharedLogger.info(`Completed Request: ${method} ${url} - Status ${status} - Duration ${duration}s`, context);
};

// Exporting The Registry For Custom Metrics Scraping Endpoint
export { registry, transaction_throughput_total, ledger_invariant_violation_count, sharedLogger };
