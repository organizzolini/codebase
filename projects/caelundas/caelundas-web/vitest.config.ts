import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "@codebase/configuration/vitest.config";

// Deliberately not merged with `vite.config.mts`: the TanStack Start plugin
// code-splits every route component into a lazy chunk, which a test would then
// have to suspend on before it could render the page it imported. Server
// function files are left out of coverage because `createServerFn` only runs
// inside the Start runtime; the logic they delegate to is tested in each
// module's `.utilities.ts`.
//
// The events database's worker and the page-side client that starts it need
// a real browser, which jsdom is not; tests read the same SQL through
// `node:sqlite` instead.
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
          "src/**/*.browser.ts",
          "src/**/*.functions.ts",
          "src/**/*.worker.ts",
          "src/client.tsx",
          "src/routeTree.gen.ts",
          "src/router.tsx",
          "src/routes/__root.tsx",
        ],
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },
      environment: "jsdom",
    },
  }),
);
