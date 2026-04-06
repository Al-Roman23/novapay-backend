import { defineWorkspace } from "vitest/config";

// Defining The Tests Workspace Environment For Our Certified Mission-Critical Microservices
export default defineWorkspace([
    "services/*/vitest.config.ts",
]);
