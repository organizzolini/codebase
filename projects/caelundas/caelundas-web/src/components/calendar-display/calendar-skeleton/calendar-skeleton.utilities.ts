// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The width assumed where there is no window to ask.
 */
export function isWideOnServer(): boolean {
  return true;
}

/**
 * Names the items of a list that never reorders, so each can be a key.
 */
export function listKeys(prefix: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, index) => `${prefix}-${String(index)}`,
  );
}
