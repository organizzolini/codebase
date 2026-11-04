// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Moves focus to the row a number of rows from an element, among the rows of
 * its list; from the search box, where the number is 0, to the first row.
 */
export function focusSibling(element: HTMLElement, step: number): void {
  const scope =
    element.closest("[data-testid='filter-tag-editor']") ??
    element.parentElement;
  const rows = [
    ...(scope?.querySelectorAll<HTMLElement>("[role='option']") ?? []),
  ];
  const index = rows.indexOf(element);

  rows[index === -1 ? 0 : index + step]?.focus();
}
