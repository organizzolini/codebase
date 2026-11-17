import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/typescript/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [
          "src/**/*.test.ts",
          "src/**/*.entity.ts",
          "src/**/*.constants.ts",
          "src/**/*.module.ts",
          "src/**/*.types.ts",
        ],
        include: ["src/**/*.ts"],
      },
    },
  }),
);
