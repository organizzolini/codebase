import { createRouter, type Router } from "@tanstack/react-router";

import { PageNotFound } from "./components/page-not-found/page-not-found";
import { routeTree } from "./routeTree.gen";

/**
 * Creates the application router, which TanStack Start calls once per request
 * on the server and once on the client.
 */
export function getRouter(): Router<typeof routeTree, "never", true> {
  return createRouter({
    defaultNotFoundComponent: () => <PageNotFound />,
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
  /** Registers the router, typing links and hooks to its routes. */
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
