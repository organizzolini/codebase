// ♟️ Constants
import { CalendarEventDerived } from "./entities/calendar-event-derived.entity";
import { CalendarEventTagNode } from "./entities/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { ConstellationLine } from "./entities/constellation-line.entity";
import { Constellation } from "./entities/constellation.entity";
import { Star } from "./entities/star.entity";
import { TagNode } from "./entities/tag-node.entity";
import { Tag } from "./entities/tag.entity";
import { Migration1793943848972 } from "./migrations/1793943848972-migration";

/** The project name `CAELUNDAS_SQLITE_DATABASE` derives from. */
export const CAELUNDAS_DATABASE_PROJECT = "caelundas";

/** The tables, derived tables and view, shared by every application that opens the caelundas SQLite file. */
export const CAELUNDAS_DATABASE_ENTITIES = [
  CalendarEvent,
  CalendarEventDerived,
  CalendarEventTag,
  CalendarEventTagNode,
  Constellation,
  ConstellationLine,
  Star,
  Tag,
  TagNode,
];

/** The one migration that creates the database, shared by the runtime module and the tests. */
export const CAELUNDAS_DATABASE_MIGRATIONS = [Migration1793943848972];
