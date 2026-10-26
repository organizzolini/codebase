import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        /**
         * Entities as well as tests, as lexico-entities excludes them: an
         * entity is decorators alone, whose only branches are the
         * `design:type` metadata the compiler emits for each column's type.
         * The integration suite exercises every column against a database.
         */
        exclude: ["src/**/*.entity.ts", "src/**/*.test.ts"],
        include: ["src/**/*.ts"],
      },
      /**
       * The command-line runner hands every message to the real
       * `LoggerService`, so its convention is checked; silent keeps the
       * lines themselves out of the test output.
       */
      env: { LOG_LEVEL: "silent" },
      /**
       * Two minutes per `beforeAll`, where the shared default is ten seconds:
       * an integration suite's hook pulls and starts a Postgres
       * container and migrates it, which takes several seconds on a
       * developer's machine and several times that on a CI runner.
       */
      hookTimeout: 120_000,
      /** Two minutes per test too, for the containers some tests start themselves. */
      testTimeout: 120_000,
    },
  }),
);
