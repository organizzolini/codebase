import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/**
 * One choice: what it is called, what it is worth and the icon beside it.
 */
export interface DisplayRadioOption {
  icon: LucideIcon;
  label: string;
  value: string;
}
