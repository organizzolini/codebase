import {
  LIBRARY_GROUP_DETAILS,
  LIBRARY_GROUP_FIELDS,
  LIBRARY_GROUP_VALUES,
} from "./library-group.constants";

import type { LibraryGroupField } from "../../../graphql/generated/operations";
import type { LibraryAuthorRow } from "../library-grid/library-grid.types";

// 🔏 Private Functions

// 🌎 Public Functions

/** The wording of a group attribute, falling back to the field. */
export function describeGroup(field: LibraryGroupField): string {
  return LIBRARY_GROUP_DETAILS.get(field)?.label ?? field;
}

/**
 * The heading an author falls under, one value per group joined with a slash,
 * or null when nothing is grouped.
 */
export function groupHeading(
  row: Readonly<LibraryAuthorRow>,
  groups: readonly LibraryGroupField[],
): null | string {
  return groups.length === 0
    ? null
    : groups.map((group) => LIBRARY_GROUP_VALUES[group](row)).join(" / ");
}

/** The levels in the order the attributes are given, dropping any not grouped. */
export function reorderGroups(
  groups: readonly LibraryGroupField[],
  order: readonly string[],
): LibraryGroupField[] {
  return order.flatMap((value) => {
    const field = LIBRARY_GROUP_FIELDS.get(value);

    return field !== undefined && groups.includes(field) ? [field] : [];
  });
}

/** Adds an attribute as the innermost group, or removes it when it is one already. */
export function toggleGroup(
  groups: readonly LibraryGroupField[],
  field: LibraryGroupField,
): LibraryGroupField[] {
  return groups.includes(field)
    ? groups.filter((_, index) => index !== groups.indexOf(field))
    : [...groups, field];
}
