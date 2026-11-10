// 🏷️ Types

/**
 * Words of a destination, each with its definition or `""` when unwritten. A
 * map so `constructor` cannot collide with an inherited property.
 */
export type Glossary = ReadonlyMap<string, string>;

/**
 * How one destination disagrees with the code. Agreement means both lists are
 * empty; an empty definition is never a disagreement.
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
