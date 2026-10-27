import { Search } from "lucide-react";

import type { NavigationItem } from "../types/root.types";

/**
 * The pages the sidebar links to.
 */
export const navigationItems: NavigationItem[] = [
  { href: "/search", icon: Search, label: "Search" },
];
