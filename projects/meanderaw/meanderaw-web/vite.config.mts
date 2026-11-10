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
