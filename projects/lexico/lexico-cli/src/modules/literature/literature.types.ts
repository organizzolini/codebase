// 🏷️ Types

import type {
  CommandOptionChoice,
  CommandOptionValue,
} from "../lexico-ingestion/lexico-ingestion.types";
import type { Author, Text, TextCollection } from "@codebase/lexico-db";
import type { PhrasingContent } from "mdast";

/** Typed author columns read from author metadata, in entity property names. */
export interface AuthorAttributes {
  endYear?: number | undefined;
  fullName?: string | undefined;
  startYear?: number | undefined;
}

/**
 * Inputs required to ingest one markdown text into the literature entity graph.
 */
export interface IngestTextArguments {
  author: Author;
  parentText: Text | undefined;
  textPath: string;
  textSlugName: string;
  title: string;
}

/**
 * Discovered markdown file metadata collected from `data/library`.
 */
export interface LibraryEntry {
  authorSlug: string;
  fullPath: string;
  pathParts: string[];
  provider: string;
  textSlug: string;
  title: string;
}

/** Optional literature filters; `true` for a bare flag, or absent. */
export interface LiteratureCommandOptions {
  author?: CommandOptionValue;
  provider?: CommandOptionValue;
  text?: CommandOptionValue;
}

/**
 * Inputs for resolving one literature filter from its flag or a prompt.
 */
export interface LiteratureFilterArguments {
  choices: CommandOptionChoice[];
  label: string;
  message: string;
  value: CommandOptionValue;
}

/**
 * Parsed line label and associated inline markdown nodes.
 */
export interface ParsedLabelResult {
  label: string;
  lineNodes: PhrasingContent[];
}

/** Typed text columns read from frontmatter, in entity property names. */
export interface TextAttributes {
  collection?: TextCollection | undefined;
  edition?: string | undefined;
  editors?: string | undefined;
  printYear?: number | undefined;
  publisher?: string | undefined;
  workIdentifier?: string | undefined;
}
