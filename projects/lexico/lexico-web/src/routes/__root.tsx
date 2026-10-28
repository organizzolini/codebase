import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import {
  Button,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@codebase/presentation";

import { ApplicationSidebar } from "../components/application-sidebar/application-sidebar";
import applicationCss from "../styles/application.css?url";

import type { ReactNode } from "react";

// 🧭 Route

/**
 * The document shell every other route renders inside.
 */
export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      { href: "/favicon.ico", rel: "icon" },
      { href: applicationCss, rel: "stylesheet" },
    ],
    meta: [
      {
        charSet: "utf8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "LexicoWeb",
      },
      {
        content:
          "Lexico is a Latin dictionary and reader application for students and scholars.",
        name: "description",
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

// 🧩 Component

/**
 * 404 Not Found page component.
 *
 */
function NotFound(): ReactNode {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
      <Button
        className="mt-4"
        nativeButton={false}
        render={<Link to="/" />}
      >
        Go Home
      </Button>
    </div>
  );
}

/**
 * Renders the layout every page sits in: the sidebar, and the matched route
 * inside the main region beside it.
 */
function RootComponent(): ReactNode {
  return (
    <SidebarProvider>
      <ApplicationSidebar />
      <SidebarInset>
        {/* On a phone the sidebar is a sheet with no rail, so this is the only control that opens it */}
        <SidebarTrigger className="fixed top-3 left-3 z-20 md:hidden" />
        {/* 16px matches the gap between result cards; the floating sidebar already leaves 8px on its side */}
        <div className="flex-1 p-4 md:pl-2">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Renders the HTML document around the matched route.
 */
function RootDocument(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  const { children } = properties;

  return (
    <html
      className="dark"
      lang="en"
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
