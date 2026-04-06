import { defineConfig } from "vitest/config";

// Configuration For Transaction Service Unit Testing Environment
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
    },
});
