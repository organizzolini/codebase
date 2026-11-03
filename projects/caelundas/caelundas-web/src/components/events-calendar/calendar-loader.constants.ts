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

// What the last load of the landing page, a visit and not a preload, read: a
// change to the link that leaves it the same, such as one to the backdrop's
// `sky.*` keys, has nothing for the loader to reload.
export const loadedKeys = { current: "" };
