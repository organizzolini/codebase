import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../projects/configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [
          "src/**/*.constants.ts",
          "src/**/*.module.ts",
          "src/**/*.test.ts",
          "src/**/*.types.ts",
          "src/codependix-nx.module.ts",
          "src/codependix-nx.ts",
        ],
        include: ["src/**/*.ts"],
      },
    },
  }),
);
