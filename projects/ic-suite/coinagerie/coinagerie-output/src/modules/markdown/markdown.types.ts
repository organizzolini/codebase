// 🏷️ Types

import type { Glossary } from "@coinagerie/core";

/** Where a file's glossary block sits, as zero-indexed line numbers. */
export interface AnchorRange {
  end: number;
  start: number;
}

/** What the block parser carries from one line to the next. */
export interface BlockParserState {
  /** The word being read, with its definition's lines so far. */
  current: undefined | { lines: string[]; word: string };
  filePath: string;
  glossary: Map<string, string>;
  /** Blank lines seen since the last line of the current definition. */
  pendingBlankLines: number;
  /** Whether the first bullet has been seen; everything above it is prose. */
  readingBullets: boolean;
}

/** What a markdown block is rendered from. */
export interface RenderMarkdownArguments {
  /** Rendered under the heading when present. */
  description?: string | undefined;
  glossary: Glossary;
}
