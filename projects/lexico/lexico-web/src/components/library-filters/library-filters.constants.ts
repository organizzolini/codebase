import {
  AuthorEra,
  LibraryTextKind,
  TextCollection,
} from "../../graphql/generated/operations";

// ♟️ Constants

/** Filters that pick from a fixed list of values. */
export const LIBRARY_CHECKBOX_FILTERS = [
  {
    key: "eras",
    label: "Era",
    options: [
      { label: "Archaic", value: AuthorEra.Archaic },
      { label: "Classical", value: AuthorEra.Classical },
      { label: "Imperial", value: AuthorEra.Imperial },
      { label: "Late", value: AuthorEra.Late },
      { label: "Medieval", value: AuthorEra.Medieval },
      { label: "Neo-Latin", value: AuthorEra.NeoLatin },
    ],
  },
  {
    key: "collections",
    label: "Collection",
    options: [
      { label: "CSEL", value: TextCollection.Csel },
      { label: "EDCS", value: TextCollection.Edcs },
      { label: "Perseus", value: TextCollection.Perseus },
      { label: "The Latin Library", value: TextCollection.TheLatinLibrary },
    ],
  },
  {
    key: "kinds",
    label: "Book or text",
    options: [
      { label: "Book", value: LibraryTextKind.Book },
      { label: "Text", value: LibraryTextKind.Text },
    ],
  },
] as const;

/** Filters whose values are open-ended, typed as a comma-separated list. */
export const LIBRARY_LIST_FILTERS = [
  { key: "provinces", label: "Provinces" },
  { key: "inscriptionTypes", label: "Inscription types" },
  { key: "materials", label: "Materials" },
] as const;

/** Filters with a minimum and a maximum; the URL carries each as key plus Minimum or Maximum. */
export const LIBRARY_RANGE_FILTERS = [
  { hint: "Negative for BCE", key: "authorYears", label: "Author years" },
  {
    hint: "Negative for BCE",
    key: "inscriptionYears",
    label: "Inscription years",
  },
  { key: "printYears", label: "Print year" },
  { key: "lineCount", label: "Line count" },
  { key: "wordCount", label: "Word count" },
] as const;
