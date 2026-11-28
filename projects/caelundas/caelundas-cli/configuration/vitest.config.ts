import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/typescript/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        /**
         * Entities as well as tests: an entity is decorators alone, whose
         * only branches are the `emitDecoratorMetadata` fallbacks the
         * compiler adds, and no test can reach them.
         */
        exclude: ["src/**/*.entity.ts", "src/**/*.test.ts"],
        include: ["src/**/*.ts"],
      },
      /**
       * Thirty seconds per test, where Vitest's default is five: ephemeris
       * tests ran 15 to 30 times slower on a loaded CI runner. Temporary,
       * until the Caelundas suites run faster there; a heavier test names
       * its own.
       */
      testTimeout: 30_000,
    },
  }),
);
