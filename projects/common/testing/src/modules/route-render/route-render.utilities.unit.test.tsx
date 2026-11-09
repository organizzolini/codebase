// @vitest-environment jsdom
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { renderRoute } from "./route-render.utilities";

import type { AnyRoute, Router } from "@tanstack/react-router";
import type { ReactNode } from "react";

// 🧪 Tests

/** A document shell like every TanStack Start root renders, which cannot mount inside a test's `<div>`. */
function DocumentShell(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  return (
    <html lang="la">
      <body>{properties.children}</body>
    </html>
  );
}

/** Builds a router like an application's `getRouter`, with a home page and a page whose loader runs. */
function getRouter(): Router<AnyRoute> {
  const rootRoute = createRootRoute({ shellComponent: DocumentShell });
  const homeRoute = createRoute({
    component: () => <h1>Salve</h1>,
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const poemRoute = createRoute({
    component: function Poem(): ReactNode {
      return <h1>{poemRoute.useLoaderData()}</h1>;
    },
    getParentRoute: () => rootRoute,
    loader: () => "Metamorphoses",
    path: "/poem",
  });

  return createRouter({
    routeTree: rootRoute.addChildren([homeRoute, poemRoute]),
  });
}

describe(renderRoute, () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the page at a path inside a test, without the document shell", async () => {
    const { container } = await renderRoute(getRouter(), "/");

    await expect(
      screen.findByRole("heading", { level: 1, name: "Salve" }),
    ).resolves.toBeDefined();
    expect(container.querySelector("body")).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("runs the route's loader the way a navigation would", async () => {
    await renderRoute(getRouter(), "/poem");

    await expect(
      screen.findByRole("heading", { name: "Metamorphoses" }),
    ).resolves.toBeDefined();
  });
});
