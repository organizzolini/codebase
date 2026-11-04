import { Link } from "@tanstack/react-router";

import { SidebarMenuButton, SidebarMenuItem } from "@codebase/presentation";

import type { NavigationItem } from "./application-sidebar.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The page a row links to, and the path open now, which marks it active.
 */
export interface NavigationLinkProperties {
  className?: string;
  currentPath: string;
  item: NavigationItem;
}

// 🧩 Component

/**
 * Render one navigation row as a router link.
 */
export function NavigationLink(
  properties: Readonly<NavigationLinkProperties>,
): ReactNode {
  const { className, currentPath, item } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const isActive =
    currentPath === item.href ||
    (item.href === "/search" && currentPath === "/");

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="navigation-link"
      style={{ display: "contents" }}
    >
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          render={<Link to={item.href} />}
          tooltip={item.label}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </div>
  );
}
