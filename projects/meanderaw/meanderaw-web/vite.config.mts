import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // The generated route tree lives under `src/`. Test files sit beside the
    // routes they test, so the route generator is told to skip them rather than
    // treat them as routes.
    tanstackStart({
      router: {
        generatedRouteTree: "routeTree.gen.ts",
        routeFileIgnorePattern: String.raw`\.test\.`,
      },
    }),
    // The React plugin must come after the TanStack Start plugin.
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  root: import.meta.dirname,
  server: {
    port: 2161,
  },
});
