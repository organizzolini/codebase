import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { vi } from "vitest";

import { getRouter } from "../src/router";

import {
  type CalendarApi,
  type CalendarApiOptions,
  serveCalendarApi,
} from "./calendar-api";

// The real root renders a whole `<html>` document, which cannot mount inside
// the `<div>` a test renders into, so routes are rendered under a bare root.
vi.mock(import("../src/routes/__root"), async () => {
  const { createRootRoute } = await import("@tanstack/react-router");

  return { Route: createRootRoute() };
});

/**
 * What a route test may change about the API it renders against.
 */
export interface RenderRouteOptions {
  /**
   * The API the route reads, as `serveCalendarApi` serves it; pass your own to
   * inspect it or to vary events or failures.
   */
  api?: CalendarApi | CalendarApiOptions;
  /**
   * Renders before the first load settles, so a test can see what shows
   * while it is pending. On by default.
   */
  waitForLoad?: boolean;
}

// Every route reads the mocked API's fixture unless a test serves another,
// which `readServedApi` hands back for what it was asked.

/**
 * Renders the application's router at a path, running that route's loader and
 * head the way a navigation would.
 */
export async function renderRoute(
  path: string,
  options: RenderRouteOptions = {},
): Promise<void> {
  if (options.api === undefined || !("requests" in options.api)) {
    serveCalendarApi(options.api);
  }

  const router = getRouter();

  router.update({
    ...router.options,
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
