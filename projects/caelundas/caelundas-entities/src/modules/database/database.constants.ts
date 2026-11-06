// ♟️ Constants
import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { ConstellationLine } from "./entities/constellation-line.entity";
import { Constellation } from "./entities/constellation.entity";
import { Star } from "./entities/star.entity";
import { Tag } from "./entities/tag.entity";

/** The project name `CAELUNDAS_SQLITE_DATABASE` derives from. */
export const CAELUNDAS_DATABASE_PROJECT = "caelundas";

/** The tables a run writes, shared by every application that opens the caelundas SQLite file. */
export const CAELUNDAS_DATABASE_ENTITIES = [
  CalendarEvent,
  CalendarEventTag,
  Constellation,
  ConstellationLine,
  Star,
  Tag,
];
