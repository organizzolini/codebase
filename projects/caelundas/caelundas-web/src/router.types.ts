import type { EventsDatabase } from "./lib/events-database/events-database.types";

/**
 * What every route's loader receives. The database travels in the router's
 * context so a test can hand the routes a `node:sqlite` one instead of the
 * browser's worker.
 */
export interface RouterContext {
  eventsDatabase: EventsDatabase;
}
