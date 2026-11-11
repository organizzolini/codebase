// 🏷️ Types

import type { ResolvedCoinagerieOutput } from "@coinagerie/configuration";
import type { Glossary, GlossaryDifference } from "@coinagerie/core";

/** What `check` and `write` are asked to do. */
export interface DeliverArguments {
  destinations: ResolvedCoinagerieOutput[];
  /** The codebase's vocabulary, sorted and de-duplicated. */
  words: string[];
}

/** How one destination differed, and whether `write` changed its file. */
export interface DeliveryResult extends GlossaryDifference {
  /** False when the file already held exactly what would be written. */
  written: boolean;
}

/** Reads and writes a glossary; `read` throws if content cannot be parsed. */
export interface GlossaryFormatHandler {
  read(content: string | undefined, filePath: string): Glossary | undefined;
  write(args: WriteGlossaryArguments): string;
}

/** One destination, read and parsed, before anything is written. */
export interface ReadDestination {
  /** The file's content, or `undefined` when it does not exist. */
  content: string | undefined;
  destination: ResolvedCoinagerieOutput;
  /** The glossary it holds; empty when it holds none yet. */
  glossary: Glossary;
}

/** What a format writes a glossary from. */
export interface WriteGlossaryArguments {
  /** The file's current content, or `undefined` when it does not exist. */
  content: string | undefined;
  destination: ResolvedCoinagerieOutput;
  /** The glossary to write, already reconciled and sorted. */
  glossary: Glossary;
}
