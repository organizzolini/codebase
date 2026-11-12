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

/**
 * The tabs' current choices.
 */
export interface Selection {
  mood: string;
  tense: string;
  voice: string;
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
