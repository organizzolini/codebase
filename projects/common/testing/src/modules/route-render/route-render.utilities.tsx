import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";

import type { AnyRoute, Router } from "@tanstack/react-router";
import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * Renders an application's router at a path, running that route's loader and
 * head the way a navigation would. The root's document shell renders a whole
 * `<html>` document, which cannot mount inside the `<div>` a test renders
 * into, so it is swapped for one that renders the page alone.
 *
 * ```ts
 * await renderRoute(getRouter(), "/search");
 * ```
 */
export async function renderRoute(
  router: Router<AnyRoute>,
  path: string,
): Promise<RenderResult> {
  Object.assign(router.routeTree.options, { shellComponent: PageOnly });
  router.update({
    ...router.options,
    history: createMemoryHistory({ initialEntries: [path] }),
    scrollRestoration: false,
  });
  await router.load();

  return render(<RouterProvider router={router} />);
}

/** A document shell that renders the page and nothing around it. */
function PageOnly(properties: Readonly<{ children: ReactNode }>): ReactNode {
  return properties.children;
}
