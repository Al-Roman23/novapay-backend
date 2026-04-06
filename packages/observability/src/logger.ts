// Universal Logger Utility For NovaPay Backend

export interface LogContext {
    requestId?: string;
    userId?: string;
    transactionId?: string;
}

export class Logger {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    // Helper To Scrub Sensitive Information From Any Object Or String
    private scrub(data: any): any {
        if (!data) return data;

        const SENSITIVE_KEYS = ["password", "token", "card", "cvv", "master_encryption_key"];

        if (typeof data === "string") {
            let scrubbedString = data;
            SENSITIVE_KEYS.forEach(key => {
                if (data.toLowerCase().includes(key)) {
                    scrubbedString = "[REDACTED]";
                }
            });
            return scrubbedString;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.scrub(item));
        }

        if (typeof data === "object") {
            const scrubbedObj: any = {};
            for (const key in data) {
                if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
                    scrubbedObj[key] = "[REDACTED]";
                } else {
                    scrubbedObj[key] = this.scrub(data[key]);
                }
            }
            return scrubbedObj;
        }

        return data;
    }

    // Standard Log Handler For All Services
    private log(level: string, message: string, context?: LogContext, metadata?: any) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            level: level.toUpperCase(),
            message,
            requestId: context?.requestId || "N/A",
            userId: context?.userId || "N/A",
            transactionId: context?.transactionId || "N/A",
            metadata: metadata ? this.scrub(metadata) : undefined
        };

        // Outputting Strictly JSON To Console For Docker Logs Collection
        console.log(JSON.stringify(logEntry));
    }

    info(message: string, context?: LogContext, metadata?: any) {
        this.log("info", message, context, metadata);
    }

    error(message: string, error: any, context?: LogContext) {
        this.log("error", message, context, {
            error_message: error?.message || error,
            stack: error?.stack
        });
    }

    warn(message: string, context?: LogContext, metadata?: any) {
        this.log("warn", message, context, metadata);
    }
}
