import {
  REDUCED_MOTION_QUERY,
  ROW_SELECTOR,
  SCROLL_VIEWPORT_SELECTOR,
  SEARCH_INPUT_SELECTOR,
} from "./use-scroll-expanded-to-top.constants";

// 🔏 Private Functions

/**
 * Scrolls the row to the top of its list, unless the list fits or the row is already there.
 */
export function scrollRowToTop(branch: HTMLElement): void {
  const row = branch.closest<HTMLElement>(ROW_SELECTOR) ?? branch;
  const viewport = row.closest<HTMLElement>(SCROLL_VIEWPORT_SELECTOR);

  if (viewport === null || viewport.scrollHeight <= viewport.clientHeight) {
    return;
  }

  const offset =
    row.getBoundingClientRect().top - viewport.getBoundingClientRect().top;

  if (Math.abs(offset) < 1) {
    return;
  }

  const isReduced = globalThis.matchMedia(REDUCED_MOTION_QUERY).matches;

  viewport.scrollBy({ behavior: isReduced ? "auto" : "smooth", top: offset });
}

/**
 * Scrolls each branch that opens to the top of its list, unless a search is typed; returns the stop.
 */
export function watchExpansion(root: HTMLElement): () => void {
  const observer = new MutationObserver((records) => {
    const row = findOpened(records);

    if (row !== undefined && !isSearching(root)) {
      scrollRowToTop(row);
    }
  });

  observer.observe(root, {
    attributeFilter: ["aria-expanded"],
    attributeOldValue: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
  };
}

// 🌎 Public Functions

/**
 * The first element whose branch was closed and is now open, if any.
 */
function findOpened(records: MutationRecord[]): HTMLElement | undefined {
  for (const { oldValue, target } of records) {
    if (
      target instanceof HTMLElement &&
      target.getAttribute("aria-expanded") === "true" &&
      oldValue === "false"
    ) {
      return target;
    }
  }

  return undefined;
}

/**
 * Whether a search is typed, which holds branches open unasked.
 */
function isSearching(root: HTMLElement): boolean {
  const value = root.querySelector<HTMLInputElement>(
    SEARCH_INPUT_SELECTOR,
  )?.value;

  return value !== undefined && value !== "";
}
