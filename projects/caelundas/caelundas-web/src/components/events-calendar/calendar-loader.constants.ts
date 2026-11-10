import type { EventFilterQuery } from "../calendar-filters/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/presets.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDataset,
} from "./calendar-records.types";

export const CONSTANTS_CACHE = new Map<
  string,
  Promise<{
    dataset: EventsDataset | null;
    defaultFilter: EventFilterQuery | undefined;
    presets: ResolvedPreset[];
  }>
>();

export const FACETS_CACHE = new Map<string, Promise<EventFacet[]>>();

export const EVENTS_CACHE = new Map<string, Promise<CalendarEventRecord[]>>();

// Enough recent windows to step back and forth through a few months, or
// views, without reading any of them twice.
export const CACHED_READS = 24;

// What the last load of the landing page, a visit and not a preload, read: a
// change to the link that leaves it the same, such as one to the backdrop's
// `sky.*` keys, has nothing for the loader to reload.
export const loadedKeys = { current: "" };
