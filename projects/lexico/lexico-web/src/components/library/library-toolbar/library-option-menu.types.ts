import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/** One option of a checklist menu: its value, wording, and icon. */
export interface LibraryOption {
  icon: LucideIcon;
  label: string;
  value: string;
}
