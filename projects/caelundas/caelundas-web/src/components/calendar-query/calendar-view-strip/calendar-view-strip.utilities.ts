import { toEventFilterInput } from "../calendar-filters/components/event-filter-model/event-filter-input.utilities";
import { EMPTY_EVENT_FILTER } from "../calendar-filters/components/event-filter-model/event-filter-tree.constants";

import { ALL_EVENTS_ID, CUSTOM_ID } from "./calendar-view-strip.constants";

import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/components/presets/presets.types";
import type { ViewChoice } from "./calendar-view-strip.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The id of the choice the filter tree matches, or custom when it matches none; the input the API is sent says whether two trees filter alike, whatever their ids.
 */
export function findActiveViewId(
  presets: readonly ResolvedPreset[],
  query: EventFilterQuery,
): string {
  const current = JSON.stringify(toEventFilterInput(query));

  if (current === "null") {
    return ALL_EVENTS_ID;
  }

  const match = presets.find(
    (preset) => JSON.stringify(toEventFilterInput(preset.filter)) === current,
  );

  return match?.id ?? CUSTOM_ID;
}

/**
 * The filter tree a choice applies: its preset's, or none for every event.
 */
export function getViewFilter(
  presets: readonly ResolvedPreset[],
  id: string,
): EventFilterQuery | undefined {
  if (id === ALL_EVENTS_ID) {
    return EMPTY_EVENT_FILTER;
  }

  return presets.find((preset) => preset.id === id)?.filter;
}

/**
 * What can be picked: each preset, then every event.
 */
export function listViewChoices(
  presets: readonly ResolvedPreset[],
): ViewChoice[] {
  return [
    ...presets.map((preset) => ({
      description: preset.description,
      id: preset.id,
      label: preset.name,
    })),
    {
      description: "Every event, with no filter.",
      id: ALL_EVENTS_ID,
      label: "All events",
    },
  ];
}
