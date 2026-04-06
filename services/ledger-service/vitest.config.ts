import { defineConfig } from "vitest/config";

// Configuration For Ledger Service Unit Testing Environment
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
    },
});
