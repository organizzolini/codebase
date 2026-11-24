import { toEventFilterInput } from "../calendar-filters/components/event-filter-model/event-filter-input.utilities";
import { EMPTY_EVENT_FILTER } from "../calendar-filters/components/event-filter-model/event-filter-tree.constants";

import {
  ALL_EVENTS_ID,
  CUSTOM_ID,
  DEFAULT_VIEW_ICON,
  VIEW_ICONS,
} from "./calendar-view-strip.constants";

import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/components/presets/presets.types";
import type { ViewChoice } from "./calendar-view-strip.types";

// 🔏 Private Functions

// 🌎 Public Functions

/** The id of the choice the filter tree matches, or custom; the API input, not ids, decides whether trees filter alike. */
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
 * The filter tree a choice applies: its preset's, or none for every event, which also stands for a choice the presets no longer have.
 */
export function getViewFilter(
  presets: readonly ResolvedPreset[],
  id: string | undefined,
): EventFilterQuery {
  return (
    presets.find((preset) => preset.id === id)?.filter ?? EMPTY_EVENT_FILTER
  );
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
      icon: VIEW_ICONS[preset.id] ?? DEFAULT_VIEW_ICON,
      id: preset.id,
      label: preset.name,
    })),
    {
      description: "Every event, with no filter.",
      icon: VIEW_ICONS[ALL_EVENTS_ID] ?? DEFAULT_VIEW_ICON,
      id: ALL_EVENTS_ID,
      label: "All events",
    },
  ];
}
