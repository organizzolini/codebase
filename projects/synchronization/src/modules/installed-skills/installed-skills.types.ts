// 🏷️ Types

/**
 * Which locked skills are absent from disk, or why that could not be told.
 *
 * "Nothing is missing" and "nothing could be read" are different answers, so
 * they are different variants rather than one empty list.
 */
export type MissingSkillsResult =
  | { readonly kind: "no-lockfile" }
  | { readonly kind: "read"; readonly missing: readonly string[] }
  | { readonly kind: "unreadable"; readonly reason: string };
