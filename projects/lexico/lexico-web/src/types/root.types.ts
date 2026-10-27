import type { LucideIcon } from "lucide-react";

/**
 * One page the sidebar links to, with the icon its collapsed rail shows.
 */
export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  label: string;
}
