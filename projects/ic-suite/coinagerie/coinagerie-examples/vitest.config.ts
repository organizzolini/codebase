import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        // Fixtures and the harness that runs the command line, so there is no
        // source to instrument and an empty report is expected.
        include: [],
      },
      // Each test spawns the command line, which compiles through swc and
      // bootstraps Nest, so runs are slow. Hooks share the budget: a
      // `beforeAll` spawns one run for several cases.
      hookTimeout: 180_000,
      testTimeout: 180_000,
    },
  }),
);
