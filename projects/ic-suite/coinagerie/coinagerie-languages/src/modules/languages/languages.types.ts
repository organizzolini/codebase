// 🏷️ Types

/**
 * A language the registry reads: the extensions it claims and its tokenizer.
 * Adding a language means injecting its service and listing it.
 */
export interface Language {
  readonly extensions: readonly string[];
  tokenize: Tokenizer;
}

/**
 * The contract every language implements: a file's content and path in, its
 * raw identifiers out, unsplit. The vocabulary layer splits `parseHTTPServer`.
 */
export type Tokenizer = (content: string, path: string) => string[];
