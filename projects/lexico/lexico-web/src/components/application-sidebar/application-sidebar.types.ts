import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/** A linked page, with the icon its collapsed rail shows. */
export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  label: string;
}
