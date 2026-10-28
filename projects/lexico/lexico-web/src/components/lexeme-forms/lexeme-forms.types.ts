// 🏷️ Types

/**
 * Where loading a lexeme's forms stands.
 */
export type FormsState =
  | { rows: LexemeFormRow[]; status: "loaded" }
  | { status: "error" }
  | { status: "idle" }
  | { status: "loading" };

/**
 * One form of a lexeme and the word written for it, as the API reports it. Which
 * fields are filled depends on the kind of form.
 */
export interface LexemeFormRow {
  case?: string;
  degree?: string;
  gender?: string;
  id: string;
  /** The kind of form, such as `NominalForm` or `FiniteVerbForm`. */
  kind: string;
  mood?: string;
  number?: string;
  person?: string;
  tense?: string;
  voice?: string;
  word: string;
}

/**
 * Loads every form of a lexeme with the word written for it.
 */
export type LoadLexemeForms = (lexemeId: string) => Promise<LexemeFormRow[]>;
