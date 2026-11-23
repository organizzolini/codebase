import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/**
 * One entry of a segment's menu.
 */
export interface SegmentAction {
  icon: LucideIcon;
  isDestructive?: boolean;
  isDisabled?: boolean;
  label: string;
  onSelect: () => void;
}
