// ♟️ Constants
import path from "node:path";

/** The folder of SQL text the command applies, at the root of the project. */
const DATA_DIRECTORY = path.resolve(import.meta.dirname, "../../../data");

/**
 * Rows standing in for ingested events, for tests and for a build with no
 * ingestion behind it.
 */
export const EVENTS_DATABASE_SEED_FILE = path.join(
  DATA_DIRECTORY,
  "events-seed.sql",
);

/** The tables and indexes caelundas-web reads, derived once over the stored events. */
export const EVENTS_DATABASE_VIEWS_FILE = path.join(
  DATA_DIRECTORY,
  "events-views.sql",
);

/** Where the bundle goes when `--output` names none: `output/events.sqlite` in this project. */
export const EVENTS_DATABASE_DEFAULT_OUTPUT = path.resolve(
  import.meta.dirname,
  "../../../output/events.sqlite",
);

/** A `--source` that cannot be built from, or options that contradict each other. */
export class EventsDatabaseOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = EventsDatabaseOptionsError.name;
  }
}
