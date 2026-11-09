import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";

import type { AnyRoute, Router } from "@tanstack/react-router";
import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * Renders a router at a path, running its loader. Replaces the document shell
 * with the page alone, since `<html>` cannot mount in a `<div>`.
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
