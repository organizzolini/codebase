// 🏷️ Types

/** A language the registry reads: its extensions and tokenizer. */
export interface Language {
  readonly extensions: readonly string[];
  tokenize: Tokenizer;
}

/** Content and path in, raw unsplit identifiers out. */
export type Tokenizer = (content: string, path: string) => string[];
