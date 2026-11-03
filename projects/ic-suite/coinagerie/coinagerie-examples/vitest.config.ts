import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        // This package ships fixture projects and the harness that runs the
        // coinagerie command line over them. Every line of TypeScript here is
        // either a fixture the tool reads or a test that runs it, so there is
        // no source to instrument and the coverage report is empty by nature
        // rather than by omission.
        include: [],
      },
      // Every test here spawns the coinagerie command line, and each spawn
      // compiles the tool through swc and bootstraps Nest — seconds of work
      // on one core, repeated for every run. Hooks share the test budget
      // because a `beforeAll` is where one run is spawned for several cases to
      // read.
      hookTimeout: 180_000,
      testTimeout: 180_000,
    },
  }),
);
