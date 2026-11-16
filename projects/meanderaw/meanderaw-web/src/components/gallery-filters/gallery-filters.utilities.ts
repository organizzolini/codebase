import { FILTERS_TITLE, FOCUSABLE_SELECTOR } from "./gallery-filters.constants";

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
 * Lists what inside a popup can take focus, in tab order.
 */
export function listFocusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
}
