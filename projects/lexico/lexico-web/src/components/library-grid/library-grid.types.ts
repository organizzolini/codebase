import type { LibraryQuery } from "../../graphql/generated/operations";

// 🏷️ Types

/** The library page the route asks the server function for. */
export interface GetLibraryInput {
  page: number;
  search: string;
}

/** One Author card, with its matching Texts and match ranges. */
export type LibraryAuthorRow = LibraryPageResult["authors"][number];

/** One match range the API reports for a field's value. */
export type LibraryMatchRow = LibraryAuthorRow["matches"][number];

/** One page of the library, as the API answers it. */
export type LibraryPageResult = LibraryQuery["library"];

/** The search parameters the library URL may carry. */
export interface LibrarySearchParameters {
  page?: number | undefined;
  search?: string | undefined;
}

/** One Text inside an Author card. */
export type LibraryTextRow = LibraryAuthorRow["texts"][number];
