// 🏷️ Types

/**
 * A language this package reads: the extensions it claims, and its tokenizer.
 *
 * What the registry needs from a language module, and all it needs, so
 * adding a language is injecting its service and listing it.
 */
export interface Language {
  readonly extensions: readonly string[];
  tokenize: Tokenizer;
}

/**
 * The one contract every language implements.
 *
 * Takes a file's content and its path, and returns the raw identifiers the
 * file uses — repeats allowed, order irrelevant, never split or normalized.
 * Splitting `parseHTTPServer` into words is the vocabulary layer's job, so a
 * tokenizer only has to know its language's syntax: what is a comment, what
 * is a string, and which strings are keys.
 */
export type Tokenizer = (content: string, path: string) => string[];
