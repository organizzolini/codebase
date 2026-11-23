import type { FormsTableAxis } from "../forms-table/forms-table.types";

// 🏷️ Types

/**
 * What the tabs have narrowed a conjugation down to.
 */
export interface Conjugation {
  mood: string | undefined;
  moods: string[];
  tense: string | undefined;
  tenseRows: VerbFormRow[];
  tenses: string[];
  voice: string | undefined;
  voices: string[];
}

/** A titled table of non-finite forms, ready for a forms table. */
export interface NonFiniteSection {
  columns: FormsTableAxis[];
  label: string;
  lookup: (row: string, column: string) => string[];
  rows: FormsTableAxis[];
}

/**
 * The tabs' current choices.
 */
export interface Selection {
  mood: string;
  tense: string;
  voice: string;
}

/** What names a form's row and column, and the keys in table order. */
export interface TableKeys {
  column: (form: VerbFormRow) => string | undefined;
  columns: string[];
  row: (form: VerbFormRow) => string | undefined;
  rows: string[];
}

/** A verb form and its word; fields vary by form kind. */
export interface VerbFormRow {
  case?: string;
  kind: string;
  mood?: string;
  number?: string;
  person?: string;
  tense?: string;
  voice?: string;
  word: string;
}
