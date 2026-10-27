import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import type { CascaderLabels } from "@codebase/presentation";

/**
 * The picker's own words, the filter's: the cascader reads its keys by other
 * names than the filter's labels, so they are bridged as the filter does.
 */
export const LABELS: Partial<CascaderLabels> = {
  back: DEFAULT_FILTER_LABELS.back,
  empty: DEFAULT_FILTER_LABELS.empty,
  panelLabel: DEFAULT_FILTER_LABELS.fieldsLabel,
  rootLevel: DEFAULT_FILTER_LABELS.fieldsLabel,
  search: DEFAULT_FILTER_LABELS.searchFields,
};

export const NOTHING = (): void => {};
