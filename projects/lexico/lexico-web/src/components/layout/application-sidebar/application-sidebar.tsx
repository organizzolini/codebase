import { Link, useMatches } from "@tanstack/react-router";
import { PanelLeft } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@codebase/presentation";

import { Logo } from "../logo/logo";

import { navigationItems } from "./application-sidebar.constants";
import { NavigationLink } from "./navigation-link";

import type { ReactNode } from "react";

// 🔖 Type

/** Reads the open page and state from router and `SidebarProvider`. */
export interface ApplicationSidebarProperties {
  className?: string;
}

// 🧩 Component

/**
 * Collapsible rail with the brand in its header, labelled navigation, and a collapse toggle in its footer.
 */
export function ApplicationSidebar(
  properties: Readonly<ApplicationSidebarProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks
  const matches = useMatches();
  const { state, toggleSidebar } = useSidebar();

  // 🏗 Setup
  const currentPath = matches.at(-1)?.pathname ?? "/";

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="application-sidebar"
      style={{ display: "contents" }}
    >
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
    </div>
  );
}
