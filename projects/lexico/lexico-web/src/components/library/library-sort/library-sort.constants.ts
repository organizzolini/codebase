import {
  BookText,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  Contact,
  Gem,
  Hourglass,
  ListOrdered,
  MapPin,
  Printer,
  Shapes,
  SpellCheck,
  Sunrise,
  Sunset,
  User,
  WholeWord,
} from "lucide-react";

import { LibrarySortField } from "../../../graphql/generated/operations";

import type { LibraryOption } from "../library-toolbar/library-option-menu.types";
import type { LibrarySortOption } from "./library-sort.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

/** One icon per attribute, shared by the filter and sort menus and chips. */
export const LIBRARY_ATTRIBUTE_ICONS = {
  authorEndYear: Sunset,
  authorFullName: Contact,
  authorName: User,
  authorStartYear: Sunrise,
  authorYears: CalendarRange,
  era: Hourglass,
  inscriptionEndYear: CalendarCheck,
  inscriptionStartYear: CalendarPlus,
  inscriptionType: Shapes,
  inscriptionYears: CalendarClock,
  lineCount: ListOrdered,
  material: Gem,
  printYear: Printer,
  province: MapPin,
  recognisedWordCount: SpellCheck,
  textTitle: BookText,
  wordCount: WholeWord,
} as const satisfies Record<string, LucideIcon>;

/** Each sortable attribute's field, icon, and wording, in menu order. */
export const LIBRARY_SORT_OPTIONS: readonly LibrarySortOption[] = [
  {
    field: LibrarySortField.AuthorName,
    icon: LIBRARY_ATTRIBUTE_ICONS.authorName,
    label: "Author name",
  },
  {
    field: LibrarySortField.AuthorFullName,
    icon: LIBRARY_ATTRIBUTE_ICONS.authorFullName,
    label: "Author full name",
  },
  {
    field: LibrarySortField.AuthorEra,
    icon: LIBRARY_ATTRIBUTE_ICONS.era,
    label: "Author era",
  },
  {
    field: LibrarySortField.AuthorStartYear,
    icon: LIBRARY_ATTRIBUTE_ICONS.authorStartYear,
    label: "Author start year",
  },
  {
    field: LibrarySortField.AuthorEndYear,
    icon: LIBRARY_ATTRIBUTE_ICONS.authorEndYear,
    label: "Author end year",
  },
  {
    field: LibrarySortField.TextTitle,
    icon: LIBRARY_ATTRIBUTE_ICONS.textTitle,
    label: "Text title",
  },
  {
    field: LibrarySortField.TextPrintYear,
    icon: LIBRARY_ATTRIBUTE_ICONS.printYear,
    label: "Text print year",
  },
  {
    field: LibrarySortField.TextStartYear,
    icon: LIBRARY_ATTRIBUTE_ICONS.inscriptionStartYear,
    label: "Inscription start year",
  },
  {
    field: LibrarySortField.TextEndYear,
    icon: LIBRARY_ATTRIBUTE_ICONS.inscriptionEndYear,
    label: "Inscription end year",
  },
  {
    field: LibrarySortField.TextLineCount,
    icon: LIBRARY_ATTRIBUTE_ICONS.lineCount,
    label: "Text line count",
  },
  {
    field: LibrarySortField.TextWordCount,
    icon: LIBRARY_ATTRIBUTE_ICONS.wordCount,
    label: "Text word count",
  },
  {
    field: LibrarySortField.TextRecognisedWordCount,
    icon: LIBRARY_ATTRIBUTE_ICONS.recognisedWordCount,
    label: "Text recognised word count",
  },
];

/** Each attribute by the string a select reports for it. */
export const LIBRARY_SORT_FIELDS = new Map<string, LibrarySortField>(
  LIBRARY_SORT_OPTIONS.map(({ field }) => [field, field]),
);

/** The sortable attributes as the menu lists them, one by one. */
const LIBRARY_SORT_LEAVES = new Map<LibrarySortField, LibraryOption>(
  LIBRARY_SORT_OPTIONS.map(({ field, icon, label }) => [
    field,
    { icon, label, value: field },
  ]),
);

/** The leaves of one category, in the order given. */
const leavesOf = (fields: readonly LibrarySortField[]): LibraryOption[] =>
  fields.flatMap((field) => LIBRARY_SORT_LEAVES.get(field) ?? []);

/** The sortable attributes as the nested menu lists them: Author, Text, and Inscription, each holding its attributes. */
export const LIBRARY_SORT_MENU_OPTIONS: readonly LibraryOption[] = [
  {
    children: leavesOf([
      LibrarySortField.AuthorName,
      LibrarySortField.AuthorFullName,
      LibrarySortField.AuthorEra,
      LibrarySortField.AuthorStartYear,
      LibrarySortField.AuthorEndYear,
    ]),
    icon: LIBRARY_ATTRIBUTE_ICONS.authorName,
    label: "Author",
    value: "category-author",
  },
  {
    children: leavesOf([
      LibrarySortField.TextTitle,
      LibrarySortField.TextPrintYear,
      LibrarySortField.TextLineCount,
      LibrarySortField.TextWordCount,
      LibrarySortField.TextRecognisedWordCount,
    ]),
    icon: LIBRARY_ATTRIBUTE_ICONS.textTitle,
    label: "Text",
    value: "category-text",
  },
  {
    children: leavesOf([
      LibrarySortField.TextStartYear,
      LibrarySortField.TextEndYear,
    ]),
    icon: LIBRARY_ATTRIBUTE_ICONS.material,
    label: "Inscription",
    value: "category-inscription",
  },
];
