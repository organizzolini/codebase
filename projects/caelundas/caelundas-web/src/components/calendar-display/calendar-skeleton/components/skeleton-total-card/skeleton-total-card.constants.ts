import { listKeys } from "../../calendar-skeleton.utilities";

// ♟️ Constants

/**
 * The label widths of a card's subtotals.
 */
export const SUBTOTAL_LABELS = [
  "w-16",
  "w-20",
  "w-14",
  "w-24",
  "w-16",
  "w-20",
  "w-12",
] as const;

export const SUBTOTAL_KEYS = listKeys("subtotal", SUBTOTAL_LABELS.length);
