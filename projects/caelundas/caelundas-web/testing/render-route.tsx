import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { vi } from "vitest";

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
 * Renders the application's router at a path, running that route's loader and
 * head the way a navigation would.
 */
export async function renderRoute(
  path: string,
  options: RenderRouteOptions = {},
): Promise<void> {
  const router = getRouter();

  router.update({
    ...router.options,
    context: {
      eventsDatabase: options.eventsDatabase ?? createTestEventsDatabase(),
    },
    history: createMemoryHistory({ initialEntries: [path] }),
    scrollRestoration: false,
  });
  if (options.waitForLoad === false) {
    render(<RouterProvider router={router} />);

    return;
  }

  await router.load();

  render(<RouterProvider router={router} />);
}
