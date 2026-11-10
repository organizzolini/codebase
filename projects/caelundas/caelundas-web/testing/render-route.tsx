import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { vi } from "vitest";

import { renderRoute } from "@codebase/testing/react";

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
 * Renders the application's router at a path through the shared route
 * renderer, against the API a test hands it or the mocked API's fixture.
 */
export async function renderCalendarRoute(
  path: string,
  options: RenderRouteOptions = {},
): Promise<void> {
  if (options.api === undefined || !("requests" in options.api)) {
    serveCalendarApi(options.api);
  }

  const router = getRouter();

  if (options.waitForLoad === false) {
    // The shared renderer settles the load first, which an API that never
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
