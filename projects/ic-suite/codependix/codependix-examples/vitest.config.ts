import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [
          // The bootstrap, like every other project's `src/*.main.ts`: it reads
          // `process.argv` and sets `process.exitCode`, and the run it delegates
          // to is covered directly.
          "testing/render-examples.ts",
        ],
        // Only the renderer is source. The tests beside it and the example
        // subjects under `examples/` are not, which is why neither is measured.
        include: ["testing/render/**/*.ts"],
      },
      // 🐢 These suites build real `ts.Program`s and boot NestJS containers, far
      // beyond Vitest's 5s default. The headroom covers a shared CI runner.
      testTimeout: 30_000,
    },
  }),
);
