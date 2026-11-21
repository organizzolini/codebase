import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/** One option of a nested menu: its value, wording, icon, and, for a category, the options it holds. */
export interface LibraryOption {
  children?: readonly LibraryOption[];
  icon: LucideIcon;
  label: string;
  value: string;
}
