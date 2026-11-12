// 🏷️ Types

/** Words and definitions, empty if unwritten; a map avoids `constructor`. */
export type Glossary = ReadonlyMap<string, string>;

/** Disagreement with the code; both lists empty means agreement. */
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

/** A run's vocabulary, and each destination's disagreement with it. */
export interface VocabularyReport {
  /** One entry per configured destination, in configuration order. */
  destinations: GlossaryDifference[];
  /** Every headword the code uses, sorted and de-duplicated. */
  words: string[];
}
