import { Library, Search } from "lucide-react";

import type { NavigationItem } from "./application-sidebar.types";

// ♟️ Constants

/**
 * The pages the sidebar links to.
 */
export const navigationItems: NavigationItem[] = [
  { href: "/library", icon: Library, label: "Library" },
  { href: "/search", icon: Search, label: "Search" },
];
