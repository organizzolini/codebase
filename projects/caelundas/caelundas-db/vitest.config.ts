import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: ["src/**/*.test.ts"],
        include: ["src/**/*.ts"],
      },
      // The library is scaffolded empty; drop this with the first test.
      passWithNoTests: true,
    },
  }),
);
