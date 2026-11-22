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

/**
 * Joins the buttons and chips of a strip: flat inner edges and one border between them; Base UI's hidden focus guards beside an open trigger do not count as neighbors.
 */
export const JOINED_STRIP_CLASS_NAME =
  "[&>:not(span):is(:not(span)~*)]:rounded-l-none [&>:not(span):is(:not(span)~*)]:border-l-0 [&>:not(span):has(~:not(span))]:rounded-r-none [&>[data-testid=chip-menu]>button]:rounded-l-none [&>[data-testid=chip-menu]>button]:border-l-0 [&>[data-testid=chip-menu]:has(~:not(span))>button]:rounded-r-none";
