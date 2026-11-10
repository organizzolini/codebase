import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "@codebase/configuration/vitest.config";

// Not merged with `vite.config.mts`: the TanStack Start plugin lazy-splits
// route components, which a test would have to suspend on. Server function
// files are excluded from coverage because `createServerFn` only runs inside
// Start; their logic is tested in each module's `.utilities.ts`.
export default mergeConfig(
  vitestConfig,
  defineConfig({
    // The vendored components import each other through `@/`.
    resolve: {
      alias: {
        "@": `${import.meta.dirname}/../../common/presentation/src`,
      },
    },
    test: {
      coverage: {
        exclude: [
          "src/**/*.test.ts",
          "src/**/*.test.tsx",
          "src/**/*.functions.ts",
          "src/graphql/generated/**",
          "src/client.tsx",
          "src/routeTree.gen.ts",
          "src/router.tsx",
          "src/routes/__root.tsx",
        ],
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },
      environment: "jsdom",
      /**
       * Fifteen seconds per test, where Vitest's default is five: a jsdom test
       * that opens the calendar's menus takes about a second and a half on a
       * developer's machine, and a CI runner under load has taken more than
       * five, ejecting a pull request from the merge queue.
       */
      testTimeout: 15_000,
    },
  }),
);
