import {
  DESKTOP_MINIMUM_WIDTH,
  FILTERS_TITLE,
  TABLET_MINIMUM_WIDTH,
} from "./gallery-filters.constants";

import type { FilterSurfaceKind } from "./gallery-filters.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Words the Filters button for assistive technology, with the count of rules
 * in force.
 */
export function describeFiltersButton(activeCount: number): string {
  return activeCount === 0
    ? FILTERS_TITLE
    : `${FILTERS_TITLE}, ${String(activeCount)} active`;
}

/**
 * Picks where the builder opens for a window's width: a popover on a
 * desktop, a drawer on a tablet and a bottom sheet on a phone.
 */
export function pickFilterSurface(width: number): FilterSurfaceKind {
  if (width >= DESKTOP_MINIMUM_WIDTH) {
    return "popover";
  }

  return width >= TABLET_MINIMUM_WIDTH ? "drawer" : "sheet";
}
