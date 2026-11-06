import { createRouter, type Router } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

/**
 * Creates the application router, which TanStack Start calls once per request
 * on the server and once on the client.
 */
export function getRouter(): Router<typeof routeTree, "never", true> {
  return createRouter({
    defaultPreload: "intent",
    // A page that selects part of the search is rendered again only when that
    // part changed. The night sky hook's overrides stay stable through it: if
    // it is removed, pass `structuralSharing: true` to that hook's select.
    defaultStructuralSharing: true,
    routeTree,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  /**
   * Registers this application's router, so links and hooks are typed against
   * its route tree.
   */
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
