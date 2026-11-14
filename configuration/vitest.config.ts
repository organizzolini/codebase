import { join } from "node:path";

import { configDefaults, defineConfig } from "vitest/config";

// The shared setup by absolute path: a bare specifier resolves from the project,
// which need not list `@codebase/testing` as a dependency.
const sharedSetup = join(
  import.meta.dirname,
  "../projects/common/testing/src/setup.ts",
);

const vitestConfig = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    coverage: {
      exclude: ["src/**/*.test.ts"],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json-summary", "lcov", "html"],
      reportOnFailure: true,
      thresholds: {
        branches: 96,
        functions: 96,
        lines: 96,
        statements: 96,
      },
    },
    exclude: [...configDefaults.exclude, "**/*.packed.test.ts"],
    globals: false,
    include: [
      "src/**/*.test.js",
      "src/**/*.test.jsx",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "testing/**/*.test.js",
      "testing/**/*.test.jsx",
      "testing/**/*.test.ts",
      "testing/**/*.test.tsx",
    ],
    // A project that needs more adds its own file to this list.
    setupFiles: [sharedSetup],
  },
});

export default vitestConfig;
