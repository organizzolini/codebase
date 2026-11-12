import { defineConfig } from "vitest/config";

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
    setupFiles: ["./testing/setup.ts"],
    testTimeout: 600_000,
  },
});
