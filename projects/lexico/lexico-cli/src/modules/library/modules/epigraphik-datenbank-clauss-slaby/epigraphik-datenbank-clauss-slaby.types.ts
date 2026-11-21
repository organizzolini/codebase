// 🏷️ Types

import type { epigraphikDatenbankRecordSchema } from "./epigraphik-datenbank-clauss-slaby.constants";
import type { Author, Text } from "@codebase/lexico-db";
import type { z } from "zod";

/** Where one run writes, plus its running counts. */
export interface EdcsRun {
  author: Author;
  authorDirectory: string;
  authorSlug: string;
  booksMap: Map<string, Text>;
  missing: Record<string, number>;
  options: undefined | { text?: string };
  records: number;
}

/**
 * JSON payload returned by the EDCS query endpoint.
 */
export interface EpigraphikDatenbankChunkResponse {
  data: unknown[];
}

/** The validated shape of one EDCS record. */
export type EpigraphikDatenbankRecord = z.infer<
  typeof epigraphikDatenbankRecordSchema
>;
