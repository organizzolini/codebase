import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SidebarMenu, SidebarProvider } from "@codebase/presentation";

import { NavigationLink } from "./navigation-link";

import type { ReactNode } from "react";

const ITEM = { href: "/search", icon: Search, label: "Search" };

/**
 * A router whose only route draws the row it is handed inside a sidebar menu.
 */
function RouterWrapper(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  const [router] = useState(() =>
    createRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree: createRootRoute({
        component: () => (
          <SidebarProvider>
            <SidebarMenu>{properties.children}</SidebarMenu>
          </SidebarProvider>
        ),
      }),
    }),
  );

  return <RouterProvider router={router} />;
}

describe(NavigationLink, () => {
  it("applies its class name", async () => {
    render(
      <NavigationLink
        className="navigation-link"
        currentPath="/"
        item={ITEM}
      />,
      { wrapper: RouterWrapper },
    );

    await screen.findByTestId("navigation-link");

    expect(screen.getByTestId("navigation-link").className).toBe(
      "navigation-link",
    );
  });

  it("links to its page", async () => {
    render(
      <NavigationLink
        currentPath="/search"
        item={ITEM}
      />,
      { wrapper: RouterWrapper },
    );

    const element = await screen.findByRole("link", { name: "Search" });

    expect(element.getAttribute("href")).toBe("/search");
  });
});
