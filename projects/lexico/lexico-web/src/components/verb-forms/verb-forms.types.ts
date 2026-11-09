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

/**
 * One form of a verb and its word. Which fields are filled depends on the kind of form.
 */
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
