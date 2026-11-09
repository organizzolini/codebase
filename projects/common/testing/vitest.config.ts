import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },
    },
  }),
);
