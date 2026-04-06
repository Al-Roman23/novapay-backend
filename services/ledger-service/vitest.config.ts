import { defineConfig } from "vitest/config";

// Configuration For Ledger Service Unit Testing Environment
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        // Providing Dummy Encryption Keys For Unit Testing Resilience
        env: {
            MASTER_ENCRYPTION_KEY: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
        }
    },
});
