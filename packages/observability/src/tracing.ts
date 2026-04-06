// Distributed Tracing Infrastructure For NovaPay Backend

import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// Initialising OpenTelemetry SDK For Real-Time Performance Monitoring
export const initTracing = (serviceName: string) => {
    // Configuring The OTLP Jaeger Exporter Endpoint Connection
    const traceExporter = new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://jaeger:4317",
    });

    // Defining The Global Node SDK Instance With Auto-Instrumentation
    const sdk = new NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
        traceExporter,
        instrumentations: [
            getNodeAutoInstrumentations({
                "@opentelemetry/instrumentation-fs": {
                    enabled: false, // Disabling FS Instrumentation To Reduce Trace Noise
                },
            }),
        ],
    });

    // Starting The Distributed Tracing Provider Service Process
    sdk.start();

    // Handling Graceful Shutdown For The Tracing Provider Instance
    process.on("SIGTERM", () => {
        sdk.shutdown()
            .then(() => console.log("Tracing Terminated Successfully"))
            .catch((error) => console.log("Error Terminating Tracing", error))
            .finally(() => process.exit(0));
    });

    console.log(`Distributed Tracing Initialised For Service: ${serviceName}`);
};
