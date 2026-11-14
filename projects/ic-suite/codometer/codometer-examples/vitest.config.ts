import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        // Every line here is a tool configuration or a test that runs it, so there is no source to
        // instrument and the coverage report is empty by nature.
        exclude: ["src/**/*.ts"],
      },
      // Each test spawns the command line, which compiles, bootstraps Nest, and starts Python:
      // seconds of work per run. Suites are split so workers run them in parallel.
      // Hooks share the test budget, since one spawn can outlast the ten-second hook default.
      hookTimeout: 180_000,
      testTimeout: 180_000,
    },
  }),
);
