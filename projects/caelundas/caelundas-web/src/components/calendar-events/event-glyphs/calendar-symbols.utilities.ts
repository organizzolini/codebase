// 🌎 Public Functions

/**
 * Reads the symbols from a link, falling back to the default for a value that
 * is not one.
 */
export function parseCalendarSymbols(value: unknown): "emojis" | undefined {
  return value === "emojis" ? "emojis" : undefined;
}
