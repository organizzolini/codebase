import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // Skip test files beside the routes, so the route generator does not treat
    // them as routes.
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
});
