// ♟️ Constants
import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { Tag } from "./entities/tag.entity";

/** The project name every `CAELUNDAS_POSTGRES_*` variable and the database convention derive from. */
export const DATABASE_PROJECT = "caelundas";

/** The entities caelundas persists, shared by the runtime module and the command-line data source. */
export const DATABASE_ENTITIES = [CalendarEvent, CalendarEventTag, Tag];
