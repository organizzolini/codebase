import type { CommandOptionValue } from "../lexico-ingestion/lexico-ingestion.types";
import type { Author } from "@codebase/lexico-db";

// 🏷️ Types

/** Optional provider filters; `true` for a bare flag, or absent. */
export interface LibraryCommandOptions {
  author?: CommandOptionValue;
  provider?: CommandOptionValue;
  text?: CommandOptionValue;
}

/**
 * Provider contract for ingesting one source corpus into author/text entities.
 */
export interface LibrarySourceProvider {
  ingest: (options?: { author?: string; text?: string }) => Promise<Author[]>;
  name: string;
}
