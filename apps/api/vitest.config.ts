import { defineConfig } from "vitest/config";
import type { UserConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    exclude: [
      "node_modules",
      "dist",
      "**/generated/**",
      "**/*.integration.spec.ts",
    ],
    setupFiles: ["./src/test/setup.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/application/**", "src/domain/**", "src/interface/http/**"],
      exclude: [
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/generated/**",
        "**/test/**",
      ],
    },
    globals: false,
  },
} satisfies UserConfig);
