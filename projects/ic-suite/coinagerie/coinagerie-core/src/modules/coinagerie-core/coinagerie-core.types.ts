// 🏷️ Types

/**
 * A destination's words, each with its definition.
 *
 * A map rather than a plain object, so a word such as `constructor` or
 * `prototype` can never be confused with something every object already
 * carries. A definition is `""` when nobody has written one yet. Keys are
 * plain lowercase headwords; the forms folded into a headword are never
 * carried this far.
 */
export type Glossary = ReadonlyMap<string, string>;

/**
 * How one destination disagrees with the codebase's vocabulary.
 *
 * Both lists are sorted. A destination agrees with the code exactly when both
 * are empty; an empty definition is never a disagreement.
 */
export interface GlossaryDifference {
  /** Words the code uses that the destination does not list. */
  missing: string[];
  /** The destination's path, absolute. */
  path: string;
  /** Words the destination lists that the code no longer uses. */
  stale: string[];
  type: GlossaryFormat;
}

/** The formats a glossary destination can be written in. */
export type GlossaryFormat = "json" | "markdown";

/** Where a glossary fault was found, and what it was. */
export interface MalformedGlossaryLocation {
  /** One-indexed line of the file; absent when the fault is the whole file's. */
  line?: number | undefined;
  path: string;
  reason: string;
}

/**
 * Everything one run found: the codebase's vocabulary, and how each
 * configured destination differs from it.
 */
export interface VocabularyReport {
  /** One entry per configured destination, in configuration order. */
  destinations: GlossaryDifference[];
  /** Every headword the code uses, sorted and de-duplicated. */
  words: string[];
}
