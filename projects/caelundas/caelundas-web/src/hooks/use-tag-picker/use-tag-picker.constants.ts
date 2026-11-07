// ♟️ Constants

/**
 * What each key does on a row of the list.
 */
export const KEY_ACTIONS: Readonly<
  Record<string, "close" | "down" | "escape" | "open" | "toggle" | "up">
> = {
  " ": "toggle",
  ArrowDown: "down",
  ArrowLeft: "close",
  ArrowRight: "open",
  ArrowUp: "up",
  Enter: "toggle",
  Escape: "escape",
};
