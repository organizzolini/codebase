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
    // The generated route tree lives under `src/`. Test files sit beside the
    // routes they test, so the route generator is told to skip them rather than
    // treat them as routes.

    // The client entry is kept at its conventional `src/client.tsx` rather than
    // deleted even though TanStack would supply an identical virtual one: it
    // holds the only static `react-dom/client` import in the workspace, and
    // without it every dependency check strips `react-dom` from this project's
    // manifest and from the catalog.
    tanstackStart({
      router: {
        generatedRouteTree: "routeTree.gen.ts",
        routeFileIgnorePattern: String.raw`\.test\.`,
      },
    }),
    // The React plugin must come after the TanStack Start plugin.
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
