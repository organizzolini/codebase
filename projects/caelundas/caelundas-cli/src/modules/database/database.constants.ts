// ♟️ Constants
import path from "node:path";

import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { ConstellationLine } from "./entities/constellation-line.entity";
import { Constellation } from "./entities/constellation.entity";
import { Star } from "./entities/star.entity";
import { Tag } from "./entities/tag.entity";
import { Migration1793045891250 } from "./migrations/1793045891250-migration";
import { Migration1793628422000 } from "./migrations/1793628422000-migration";

/** The project name the `CAELUNDAS_SQLITE_DATABASE` variable derives from. */
export const DATABASE_PROJECT = "caelundas";

/** The entities caelundas persists, shared by the runtime module and the command-line data source. */
export const DATABASE_ENTITIES = [
  CalendarEvent,
  CalendarEventTag,
  Constellation,
  ConstellationLine,
  Star,
  Tag,
];

/** The migrations, oldest first, shared by the runtime module and the tests. */
export const DATABASE_MIGRATIONS = [
  Migration1793045891250,
  Migration1793628422000,
];

/**
 * Where the database file is when `CAELUNDAS_SQLITE_DATABASE` names none:
 * `output/database.sqlite` in the `caelundas-cli` project, wherever the
 * command runs from, so the web build always finds what ingestion wrote.
 */
export const DATABASE_DEFAULT_FILE = path.resolve(
  import.meta.dirname,
  "../../../output/database.sqlite",
);

/**
 * The SQL that rewrites the read-model tables caelundas-web queries from the
 * tables a run writes, in the project's `data` folder beside the seed rows.
 */
export const DATABASE_READ_MODEL_FILE = path.resolve(
  import.meta.dirname,
  "../../../data/events-read-model.sql",
);
