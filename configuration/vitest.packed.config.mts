import { join } from "node:path";

import { defineConfig } from "vitest/config";

// The shared setup by absolute path: a bare specifier resolves from the project,
// which need not list `@codebase/testing` as a dependency.
const sharedSetup = join(
  import.meta.dirname,
  "../projects/common/testing/src/setup.ts",
);

/**
 * Runs only the packed-artifact tests, `*.packed.test.ts`: the files the
 * default configuration excludes. Each installs tarballs into a sandbox, which
 * is slow, so the timeouts are generous and the files run one at a time.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    fileParallelism: false,
    globals: false,
    hookTimeout: 600_000,
    include: ["testing/**/*.packed.test.ts"],
    setupFiles: [sharedSetup],
    testTimeout: 600_000,
  },
});
