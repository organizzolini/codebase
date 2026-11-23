import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import type { CascaderLabels } from "@codebase/presentation";

// ♟️ Constants

/**
 * The filter's words, under the cascader's key names.
 */
export const LABELS: Partial<CascaderLabels> = {
  back: DEFAULT_FILTER_LABELS.back,
  empty: DEFAULT_FILTER_LABELS.empty,
};

export const NOTHING = (): void => {};

/** Joins strip buttons and chips: flat inner edges, one border between. */
export const JOINED_STRIP_CLASS_NAME =
  "[&>:not(span):is(:not(span)~*)]:rounded-l-none [&>:not(span):is(:not(span)~*)]:border-l-0 [&>:not(span):has(~:not(span))]:rounded-r-none [&>[data-testid=chip-menu]>button]:rounded-l-none [&>[data-testid=chip-menu]>button]:border-l-0 [&>[data-testid=chip-menu]:has(~:not(span))>button]:rounded-r-none";
