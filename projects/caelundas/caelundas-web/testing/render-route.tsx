import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { vi } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { getRouter } from "../src/router";

import { createTestEventsDatabase } from "./events-database";

import type { EventsDatabase } from "../src/lib/events-database/events-database.types";

// The real root renders a whole `<html>` document, which cannot mount inside
// the `<div>` a test renders into, so routes are rendered under a bare root.
vi.mock(import("../src/routes/__root"), async () => {
  const { createRootRoute } = await import("@tanstack/react-router");

  return { Route: createRootRoute() };
});

/**
 * What a route test may swap out of the application's router.
 */
export interface RenderRouteOptions {
  /**
   * Replaces the seeded `node:sqlite` database, such as with one that fails.
   */
  eventsDatabase?: EventsDatabase;
  /**
   * Renders before the first load settles, so a test can see what shows
   * while it is pending. On by default.
   */
  waitForLoad?: boolean;
}

// Every route reads a database built from the committed SQL seed unless a
// test hands it another.

/**
 * Renders the application's router at a path through the shared route
 * renderer, with the events database a test hands it in the router's context.
 */
export async function renderCalendarRoute(
  path: string,
  options: RenderRouteOptions = {},
): Promise<void> {
  const router = getRouter();

  router.update({
    ...router.options,
    context: {
      eventsDatabase: options.eventsDatabase ?? createTestEventsDatabase(),
    },
  });
  if (options.waitForLoad === false) {
    // The shared renderer settles the load first, which a database that never
    // answers would hold forever, so this renders on the pending state.
    router.update({
      ...router.options,
      history: createMemoryHistory({ initialEntries: [path] }),
      scrollRestoration: false,
    });
    render(<RouterProvider router={router} />);

    return;
  }

  await renderRoute(router, path);
}
