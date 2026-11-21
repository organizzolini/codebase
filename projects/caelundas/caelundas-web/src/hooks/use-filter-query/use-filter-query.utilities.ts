import { EMPTY_EVENT_FILTER } from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filter-tree.constants";
import { DEFAULT_PRESET_ID } from "../../components/calendar-query/calendar-filters/components/presets/presets.constants";

import type { EventFilterQuery } from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../../components/calendar-query/calendar-filters/components/presets/presets.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The filter of the default preset, or none when the data has no such
 * preset.
 */
export function getDefaultFilter(
  presets: readonly ResolvedPreset[],
): EventFilterQuery {
  return (
    presets.find((preset) => preset.id === DEFAULT_PRESET_ID)?.filter ??
    EMPTY_EVENT_FILTER
  );
}
