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
      /**
       * The Postgres suites log through the real `LoggerService`; silent keeps
       * those lines out of the test output.
       */
      env: { LOG_LEVEL: "silent" },
      /**
       * Two minutes per `beforeAll`, where the shared default is ten seconds:
       * a Postgres suite's hook pulls and starts a container and migrates it,
       * which takes several seconds on a developer's machine and several times
       * that on a CI runner.
       */
      hookTimeout: 120_000,
      /** Two minutes per test too, for the containers some tests start themselves. */
      testTimeout: 120_000,
    },
  }),
);
