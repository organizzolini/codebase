import { ArrowDown, ArrowUp } from "lucide-react";

// ♟️ Constants

/**
 * The sort items of a header's menu, one for each direction.
 */
export const SORT_ITEMS = [
  { direction: "asc", Icon: ArrowUp, label: "Sort ascending" },
  { direction: "desc", Icon: ArrowDown, label: "Sort descending" },
] as const;
