import { defineConfig } from "vitest/config";
import type { UserConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.spec.ts"],
    exclude: ["node_modules", "dist", "**/generated/**"],
    setupFiles: ["./src/test/setup.ts"],
    globals: false,
    testTimeout: 10000,
  },
} satisfies UserConfig);
