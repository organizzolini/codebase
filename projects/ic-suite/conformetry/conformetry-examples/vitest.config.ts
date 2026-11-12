import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        // Runnable examples, executed as child processes, so there is no library source to instrument.
        include: [],
      },
      // Every test runs the conformetry command as a child process, which
      // compiles the toolchain through SWC on the way in. That is seconds per
      // example rather than milliseconds, so the default five-second timeout
      // would fail on machine speed rather than on behavior.
      hookTimeout: 300_000,
      testTimeout: 300_000,
    },
  }),
);
