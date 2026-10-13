import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "{{workspaceRelativePrefix}}projects/configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: ["src/**/*.test.ts"],
        include: ["src/**/*.ts"],
      },
    },
  }),
);
