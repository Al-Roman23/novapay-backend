import { defineConfig } from "vitest/config";

// Configuration For Admin Service Unit Testing Environment
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        env: {
            MASTER_ENCRYPTION_KEY: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
        }
    },
});
