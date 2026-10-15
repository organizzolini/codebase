import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/vitest.config.ts";

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
          "src/callidescope-cli.module.ts",
          "src/callidescope-cli.main.ts",
        ],
        include: ["src/**/*.ts"],
      },
    },
  }),
);
