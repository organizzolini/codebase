import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // sqlite-wasm finds its `.wasm` file relative to its own module. Bundling it
  // into the dependency cache in development would move the module away from
  // that file, so it is served as is.
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
  plugins: [
    tailwindcss(),
    // The generated route tree lives under `src/`. Test files sit beside the
    // routes they test, so the route generator is told to skip them rather than
    // treat them as routes.
    //
    // The application is static: single-page mode renders one shell page at
    // build time, and every route renders in the browser.
    tanstackStart({
      router: {
        generatedRouteTree: "routeTree.gen.ts",
        routeFileIgnorePattern: String.raw`\.test\.`,
      },
      spa: {
        enabled: true,
        prerender: {
          outputPath: "/index.html",
        },
      },
    }),
    // The React plugin must come after the TanStack Start plugin.
    react(),
  ],
  resolve: {
    // The vendored components import each other through `@/`.
    alias: {
      "@": path.resolve(import.meta.dirname, "../../common/presentation/src"),
    },
    tsconfigPaths: true,
  },
  // The port is derived from the project name by `scripts/shell/text-to-port.sh`,
  // like every other application's, so the dev and preview servers never clash.
  preview: {
    host: "localhost",
    port: 8967,
  },
  root: import.meta.dirname,
  server: {
    host: "localhost",
    port: 8967,
  },
  worker: {
    format: "es",
  },
});
