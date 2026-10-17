import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    outDir: "dist",
    reportCompressedSize: true,
    rolldownOptions: {
      external: ["expo-sqlite"],
    },
  },
  css: {
    devSourcemap: true,
  },
  plugins: [
    tailwindcss(),
    // The generated route tree sits beside the routes it describes rather than
    // at the `src/` root, which `codebase-structure.json` restricts to
    // entry-point names, and its path resolves relative to `srcDirectory` — a
    // leading `src/` here writes to `src/src/`.

    // The client entry is kept at its conventional `src/client.tsx` rather than
    // deleted even though TanStack would supply an identical virtual one: it
    // holds the only static `react-dom/client` import in the workspace, and
    // without it every dependency check strips `react-dom` from this project's
    // manifest and from the catalog.
    tanstackStart({
      router: {
        generatedRouteTree: "routes/routeTree.gen.ts",
        // Route tests and the generated route tree sit beside the routes, so
        // the route generator skips them rather than treating each as a route.
        routeFileIgnorePattern: String.raw`\.(test|gen)\.`,
      },
    }),
    // React plugin must come after TanStack Start plugin
    react(),
  ],
  preview: {
    host: "localhost",
    port: 7797,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "../../components/src"),
    },
    tsconfigPaths: true,
  },
  root: import.meta.dirname,
  server: {
    host: "localhost",
    port: 7797,
  },
});
