import { READER_HINT_KEY } from "./reader-hint.constants";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether this browser has dismissed the hint; false when storage is unavailable.
 */
export function isHintSeen(): boolean {
  try {
    return globalThis.localStorage.getItem(READER_HINT_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Remembers in this browser that the hint was dismissed, if storage allows.
 */
export function markHintSeen(): void {
  try {
    globalThis.localStorage.setItem(READER_HINT_KEY, "true");
  } catch {
    // Storage is unavailable or full: the hint returns on the next visit.
  }
}
