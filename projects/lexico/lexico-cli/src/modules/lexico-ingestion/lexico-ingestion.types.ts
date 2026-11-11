// 🏷️ Types

/**
 * One entry an interactive option prompt offers.
 */
export interface CommandOptionChoice {
  title: string;
  value: string;
}

/** String flag value: the text, `true` if bare, or absent. */
export type CommandOptionValue = boolean | null | string | undefined;

/**
 * Optional booleans that decide which root ingestion stages execute.
 */
export interface LexicoIngestionCommandOptions {
  dictionary?: boolean;
  library?: boolean;
  librarySources?: boolean;
  literature?: boolean;
  wikipedia?: boolean;
}

/** Prompt inputs for picking a missing flag value. */
export interface SelectChoiceArguments {
  choices: CommandOptionChoice[];
  message: string;
  noSelectionTitle: string;
}

/** Cached Wiktionary metadata; `html` is filled in after download. */
export interface WiktionaryPage {
  category: string;
  href: string;
  html?: string;
  word: string;
}
