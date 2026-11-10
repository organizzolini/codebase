import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "@codebase/configuration/vitest.config";

// Deliberately not merged with `vite.config.mts`: the TanStack Start plugin
// code-splits every route component into a lazy chunk, which a test would then
// have to suspend on before it could render the page it imported. Server
// function files are left out of coverage because `createServerFn` only runs
// inside the Start runtime; the logic they delegate to is tested in each
// module's `.utilities.ts`.
//
// Tests answer the calendar's GraphQL requests with the mocked API, so they
// need neither the API nor a database.
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
