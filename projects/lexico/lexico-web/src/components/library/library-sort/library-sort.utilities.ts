import { LIBRARY_SORT_OPTIONS } from "./library-sort.constants";

import type { LibrarySortField } from "../../../graphql/generated/operations";
import type { LibrarySortDescription } from "./library-sort.types";

// 🔏 Private Functions

// 🌎 Public Functions

/** The icon and wording of a sort's attribute, wording falling back to the field. */
export function describeSort(sort: LibrarySortField): LibrarySortDescription {
  const option = LIBRARY_SORT_OPTIONS.find(({ field }) => field === sort);

  return { icon: option?.icon, label: option?.label ?? sort };
}
