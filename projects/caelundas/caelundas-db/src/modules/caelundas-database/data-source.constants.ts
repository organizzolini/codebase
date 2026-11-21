import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Migration1793990506900 } from "../../../migrations/1793990506900-migration";

import { CAELUNDAS_PROJECT } from "./caelundas-database.constants";
import { CalendarEventDerivedTime } from "./modules/calendar-events/calendar-event-derived-time.entity";
import { CalendarEventTagNode } from "./modules/calendar-events/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./modules/calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "./modules/calendar-events/calendar-event.entity";
import { ConstellationLine } from "./modules/night-sky/constellation-line.entity";
import { Constellation } from "./modules/night-sky/constellation.entity";
import { Star } from "./modules/night-sky/star.entity";
import { TagNode } from "./modules/tags/tag-node.entity";
import { Tag } from "./modules/tags/tag.entity";

/** Tables, derived tables, and view shared by every caelundas-schema app. */
export const CAELUNDAS_DATABASE_ENTITIES = [
  CalendarEvent,
  CalendarEventDerivedTime,
  CalendarEventTag,
  CalendarEventTagNode,
  Constellation,
  ConstellationLine,
  Star,
  Tag,
  TagNode,
] as const;

/** All migrations in order, for tests; the runtime runs none. */
export const CAELUNDAS_DATABASE_MIGRATIONS = [Migration1793990506900] as const;

/** TypeORM CLI data source; reads only `CAELUNDAS_POSTGRES_*`, never syncs. */
export const caelundasDataSource = createDataSource({
  entities: [...CAELUNDAS_DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: CAELUNDAS_PROJECT,
});
