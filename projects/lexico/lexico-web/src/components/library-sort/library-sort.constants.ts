import { LibrarySortField } from "../../graphql/generated/operations";

// ♟️ Constants

/** The wording of each attribute the library can be ordered by, in menu order. */
export const LIBRARY_SORT_OPTIONS: readonly {
  field: LibrarySortField;
  label: string;
}[] = [
  { field: LibrarySortField.AuthorName, label: "Author name" },
  { field: LibrarySortField.AuthorFullName, label: "Author full name" },
  { field: LibrarySortField.AuthorEra, label: "Author era" },
  { field: LibrarySortField.AuthorStartYear, label: "Author start year" },
  { field: LibrarySortField.AuthorEndYear, label: "Author end year" },
  { field: LibrarySortField.TextTitle, label: "Text title" },
  { field: LibrarySortField.TextCollection, label: "Text collection" },
  { field: LibrarySortField.TextEdition, label: "Text edition" },
  { field: LibrarySortField.TextPrintYear, label: "Text print year" },
  { field: LibrarySortField.TextStartYear, label: "Inscription start year" },
  { field: LibrarySortField.TextEndYear, label: "Inscription end year" },
  { field: LibrarySortField.TextLineCount, label: "Text line count" },
  { field: LibrarySortField.TextWordCount, label: "Text word count" },
  {
    field: LibrarySortField.TextRecognisedWordCount,
    label: "Text recognised word count",
  },
];

/** Each attribute by the string a select reports for it. */
export const LIBRARY_SORT_FIELDS = new Map<string, LibrarySortField>(
  LIBRARY_SORT_OPTIONS.map(({ field }) => [field, field]),
);

/** Each attribute's wording, by field. */
export const LIBRARY_SORT_LABELS = new Map<LibrarySortField, string>(
  LIBRARY_SORT_OPTIONS.map(({ field, label }) => [field, label]),
);
