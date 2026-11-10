// ♟️ Constants

/**
 * The colors a scheme hands out in turn, distinct side by side and legible on dark and light pages.
 */
export const COLOR_PALETTE: readonly string[] = [
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#eab308",
  "#0ea5e9",
  "#d946ef",
  "#22c55e",
  "#ef4444",
];

export const HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
