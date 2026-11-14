import {
  DESKTOP_MINIMUM_WIDTH,
  FILTERS_TITLE,
  FOCUSABLE_SELECTOR,
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
 * Lists what inside a surface can take focus, in tab order.
 */
export function listFocusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
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

/**
 * Keeps Tab inside a modal surface: from its last control it wraps to the
 * first, and Shift+Tab from the first wraps to the last.
 */
export function trapTab(event: KeyboardEvent, dialog: HTMLElement): void {
  const focusable = listFocusable(dialog);
  const edge = event.shiftKey ? focusable.at(0) : focusable.at(-1);
  const opposite = event.shiftKey ? focusable.at(-1) : focusable.at(0);
  const active = globalThis.document.activeElement;

  if (active === edge || active === dialog) {
    event.preventDefault();
    opposite?.focus();
  }
}
