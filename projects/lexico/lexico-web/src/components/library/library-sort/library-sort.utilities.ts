import { LibrarySortDirection } from "../../../graphql/generated/operations";

import { LIBRARY_SORT_OPTIONS } from "./library-sort.constants";

import type { LibrarySortField } from "../../../graphql/generated/operations";
import type {
  LibrarySortDescription,
  LibrarySortEntry,
} from "./library-sort.types";

// 🔏 Private Functions

// 🌎 Public Functions

/** The icon and wording of a sort's attribute, wording falling back to the field. */
export function describeSort(sort: LibrarySortField): LibrarySortDescription {
  const option = LIBRARY_SORT_OPTIONS.find(({ field }) => field === sort);

  return { icon: option?.icon, label: option?.label ?? sort };
}

/** Reverses the direction of one attribute's sort, leaving the order alone. */
export function flipSort(
  sorts: readonly LibrarySortEntry[],
  field: LibrarySortField,
): LibrarySortEntry[] {
  return sorts.map((entry) =>
    entry.field === field
      ? {
          direction:
            entry.direction === LibrarySortDirection.Asc
              ? LibrarySortDirection.Desc
              : LibrarySortDirection.Asc,
          field,
        }
      : entry,
  );
}

/** Adds an attribute as the last sort, ascending, or removes it when it is already one. */
export function toggleSort(
  sorts: readonly LibrarySortEntry[],
  field: LibrarySortField,
): LibrarySortEntry[] {
  return sorts.some((entry) => entry.field === field)
    ? sorts.filter((entry) => entry.field !== field)
    : [...sorts, { direction: LibrarySortDirection.Asc, field }];
}
