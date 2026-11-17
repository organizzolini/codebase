// cspell:ignore Carmina Capitula Xxii
import type { LibraryChildrenQuery } from "../../graphql/generated/operations";
import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type {
  getLibraryChildrenInputSchema,
  getLibraryWorksInputSchema,
} from "./library-text-tree-api.constants";
import type { z } from "zod";

// 🏷️ Types

/** What getLibraryChildren is called with. */
export type GetLibraryChildrenInput = z.infer<
  typeof getLibraryChildrenInputSchema
>;

/** What getLibraryWorks is called with. */
export type GetLibraryWorksInput = z.infer<typeof getLibraryWorksInputSchema>;

/** A Text whose title ends in a number or a range, such as "Carmina 21" or "Capitula Ix Xxii". */
export interface LibraryNumbered {
  first: number;
  label: string;
  last: number;
  prefix: string;
  row: LibraryTextRow;
}

/** A group of numbered Texts: one run of buttons, or one range of a long run. */
export interface LibraryNumberGroup {
  items: LibraryNumbered[];
  label: string;
}

/** A level of Texts split into those shown as rows and those shown as numbered buttons. */
export interface LibraryTextLevel {
  groups: LibraryNumberGroup[];
  rows: LibraryTextRow[];
}

/** One page of Texts, as the API answers it. */
export type LibraryTextsPage = LibraryChildrenQuery["libraryChildren"];
