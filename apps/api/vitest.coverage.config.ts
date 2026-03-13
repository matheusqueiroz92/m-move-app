import type { UserConfig } from "vitest/config";
import { defineConfig } from "vitest/config";

/**
 * Config para rodar cobertura com testes unitários + integração.
 * Inclui ambos os tipos de spec para que controllers, middlewares e rotas
 * sejam exercitados pelos testes de integração e apareçam no relatório.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.spec.ts",
      "src/**/*.integration.spec.ts",
    ],
    exclude: ["node_modules", "dist", "**/generated/**"],
    setupFiles: ["./src/test/setup.ts"],
    passWithNoTests: true,
    globals: false,
    testTimeout: 10000,
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: [
        "src/application/**",
        "src/domain/**",
        "src/interface/http/**",
        "src/infrastructure/**",
      ],
      exclude: [
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.integration.spec.ts",
        "**/generated/**",
        "**/test/**",
      ],
    },
  },
} satisfies UserConfig);
