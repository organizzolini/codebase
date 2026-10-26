import { createRouter, type Router } from "@tanstack/react-router";

import { createBrowserEventsDatabase } from "./lib/events-database/events-database.browser";
import { routeTree } from "./routeTree.gen";

/**
 * Creates the application router, which TanStack Start calls once per request
 * on the server and once on the client.
 */
export function getRouter(): Router<typeof routeTree> {
  return createRouter({
    // The browser database starts its worker on the first query, so creating
    // it while the static shell is rendered ahead of time loads nothing.
    context: { eventsDatabase: createBrowserEventsDatabase() },
    defaultPreload: "intent",
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
