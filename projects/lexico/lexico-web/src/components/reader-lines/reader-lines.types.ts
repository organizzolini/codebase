import type { TextReaderQuery } from "../../graphql/generated/operations";
import type {
  getTextInputSchema,
  readerSearchSchema,
} from "./reader-lines-api.constants";
import type { z } from "zod";

// 🏷️ Types

/** What getText is called with. */
export type GetTextInput = z.infer<typeof getTextInputSchema>;

/** A connection of lines, as the reader accumulates them. */
export type LineConnection = ReaderText["lines"];

/** One line with its tokens. */
export type ReaderLineNode = LineConnection["edges"][number]["node"];

/** A text the reader links to. */
export type ReaderLink = NonNullable<ReaderText["parentText"]>;

/** The search parameters the reader's URL carries. */
export type ReaderSearch = z.infer<typeof readerSearchSchema>;

/** One text with a page of its lines, as the reader shows it. */
export type ReaderText = NonNullable<TextReaderQuery["text"]>;
