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
          "src/callidescope-nx.module.ts",
          "src/callidescope-nx.ts",
        ],
        include: ["src/**/*.ts"],
      },
    },
  }),
);
