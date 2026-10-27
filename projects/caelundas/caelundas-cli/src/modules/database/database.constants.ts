// ♟️ Constants
import path from "node:path";

import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { Tag } from "./entities/tag.entity";

/** The project name the `CAELUNDAS_SQLITE_DATABASE` variable derives from. */
export const DATABASE_PROJECT = "caelundas";

/** The entities caelundas persists, shared by the runtime module and the command-line data source. */
export const DATABASE_ENTITIES = [CalendarEvent, CalendarEventTag, Tag];

/**
 * Where the database file is when `CAELUNDAS_SQLITE_DATABASE` names none:
 * `output/database.sqlite` in the `caelundas-cli` project, wherever the
 * command runs from, so the web build always finds what ingestion wrote.
 */
export const DATABASE_DEFAULT_FILE = path.resolve(
  import.meta.dirname,
  "../../../output/database.sqlite",
);
