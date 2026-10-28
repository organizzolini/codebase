import type {
  CalendarEventRecord,
  EventFacet,
  EventsDatabase,
} from "./events-database.types";

export const FACETS_BY_DATABASE = new WeakMap<
  EventsDatabase,
  Map<string, Promise<EventFacet[]>>
>();

export const EVENTS_BY_DATABASE = new WeakMap<
  EventsDatabase,
  Map<string, Promise<CalendarEventRecord[]>>
>();

// Enough recent windows to step back and forth through a few months, or
// views, without reading any of them twice.
export const CACHED_READS = 24;
