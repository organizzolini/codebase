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
 * One form of a verb and the word written for it. Which fields are filled
 * depends on the kind of form: a finite form has a mood, tense, voice, person
 * and number, an infinitive or participle a tense and voice, and a gerund or
 * supine a case.
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
