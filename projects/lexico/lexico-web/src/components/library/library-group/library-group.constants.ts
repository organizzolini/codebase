import { LibraryGroupField } from "../../../graphql/generated/operations";
import { LIBRARY_ATTRIBUTE_ICONS } from "../library-sort/library-sort.constants";
import { LIBRARY_ERA_OPTIONS } from "../library-toolbar/library-toolbar.constants";

import type { LibraryAuthorRow } from "../library-grid/library-grid.types";
import type { LibraryOption } from "../library-toolbar/library-option-menu.types";
import type { LibraryGroupOption } from "./library-group.types";

// ♟️ Constants

/** Each attribute authors can be grouped by, in menu order. */
export const LIBRARY_GROUP_OPTIONS: readonly LibraryGroupOption[] = [
  {
    field: LibraryGroupField.Era,
    icon: LIBRARY_ATTRIBUTE_ICONS.era,
    label: "Era",
  },
];

/** The groupable attributes as the checklist menu lists them. */
export const LIBRARY_GROUP_MENU_OPTIONS: readonly LibraryOption[] =
  LIBRARY_GROUP_OPTIONS.map(({ field, icon, label }) => ({
    icon,
    label,
    value: field,
  }));

/** Each attribute by the string a menu reports for it. */
export const LIBRARY_GROUP_FIELDS = new Map<string, LibraryGroupField>(
  LIBRARY_GROUP_OPTIONS.map(({ field }) => [field, field]),
);

/** What an author with no era is headed under. */
export const LIBRARY_NO_ERA_LABEL = "No era";

/** Each option by its field. */
export const LIBRARY_GROUP_DETAILS = new Map<
  LibraryGroupField,
  LibraryGroupOption
>(LIBRARY_GROUP_OPTIONS.map((option) => [option.field, option]));

/** The value one attribute gives an author, as its heading reads. */
export const LIBRARY_GROUP_VALUES: Record<
  LibraryGroupField,
  (row: Readonly<LibraryAuthorRow>) => string
> = {
  [LibraryGroupField.Era]: (row) =>
    LIBRARY_ERA_OPTIONS.find(({ value }) => value === row.author.era)?.label ??
    LIBRARY_NO_ERA_LABEL,
};
