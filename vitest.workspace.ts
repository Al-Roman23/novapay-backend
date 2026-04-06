import { defineWorkspace } from "vitest/config";

// Defining The Tests Workspace Environment For All Microservices And Internal Utilities
export default defineWorkspace([
    "services/*/vitest.config.ts",
    "packages/*/vitest.config.ts",
]);
