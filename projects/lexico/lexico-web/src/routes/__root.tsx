import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { PanelLeft, Search } from "lucide-react";

import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@codebase/presentation";

import { Logo } from "../components/layout";
import applicationCss from "../styles/application.css?url";

import type { ReactNode } from "react";

/**
 * Navigation item.
 */
interface NavigationItem {
  href: string;
  icon: ReactNode;
  label: string;
}

const navigationItems: NavigationItem[] = [
  { href: "/search", icon: <Search className="h-5 w-5" />, label: "Search" },
];

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
 * Application sidebar: a rail that collapses to icons, with the brand in the
 * header, navigation in a labelled group, and the collapse toggle in the
 * footer, so the page needs no bar of its own.
 */
function ApplicationSidebar(): ReactNode {
  const matches = useMatches();
  const currentPath = matches.at(-1)?.pathname ?? "/";
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/" />}
              size="lg"
              tooltip="Lexico"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo width={18} />
              </span>
              <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:sr-only">
                <span className="truncate text-sm font-medium">Lexico</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Latin Dictionary
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent
        aria-label="Primary"
        role="navigation"
      >
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <NavigationLink
                  key={item.href}
                  currentPath={currentPath}
                  item={item}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5" />
              <span>{state === "expanded" ? "Collapse" : "Expand"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

/**
 * Render one navigation row as a router link.
 */
function NavigationLink(
  properties: Readonly<{ currentPath: string; item: NavigationItem }>,
): ReactNode {
  const { currentPath, item } = properties;
  const isActive =
    currentPath === item.href ||
    (item.href === "/search" && currentPath === "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={<Link to={item.href} />}
        tooltip={item.label}
      >
        {item.icon}
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

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
