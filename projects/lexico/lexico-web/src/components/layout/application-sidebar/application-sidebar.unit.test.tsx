import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SidebarProvider } from "@codebase/presentation";

import { ApplicationSidebar } from "./application-sidebar";

import type { ReactNode } from "react";

/**
 * A router at `/search` whose only route draws the sidebar it is handed, with
 * the sidebar state the sidebar reads around it.
 */
function RouterWrapper(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  const [router] = useState(() =>
    createRouter({
      history: createMemoryHistory({ initialEntries: ["/search"] }),
      routeTree: createRootRoute({
        component: () => (
          <SidebarProvider>{properties.children}</SidebarProvider>
        ),
      }),
    }),
  );

  return <RouterProvider router={router} />;
}

describe(ApplicationSidebar, () => {
  it("applies its class name", async () => {
    render(<ApplicationSidebar className="application-sidebar" />, {
      wrapper: RouterWrapper,
    });

    await screen.findByTestId("application-sidebar");

    expect(screen.getByTestId("application-sidebar").className).toBe(
      "application-sidebar",
    );
  });

  it("links to each page", async () => {
    render(<ApplicationSidebar />, { wrapper: RouterWrapper });

    const element = await screen.findByRole("link", { name: "Search" });

    expect(element.getAttribute("href")).toBe("/search");
  });
});
