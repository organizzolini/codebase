import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        // Workspace dependencies measure their own coverage, so this allowlist keeps them out.
        // Patterns resolve against this root; do not exclude by package name, since
        // `conformetry-*` also matches `conformetry-cli` and drops everything measured here.
        exclude: ["src/**/*.test.ts"],
        include: ["src/**/*.ts"],
      },
    },
  }),
);
