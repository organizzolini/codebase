import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { CAELUNDAS_PROJECT } from "./caelundas-database.constants";
import { CalendarEventDerivedTime } from "./entities/calendar-event-derived-time.entity";
import { CalendarEventTagNode } from "./entities/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { ConstellationLine } from "./entities/constellation-line.entity";
import { Constellation } from "./entities/constellation.entity";
import { Star } from "./entities/star.entity";
import { TagNode } from "./entities/tag-node.entity";
import { Tag } from "./entities/tag.entity";
import { Migration1793990506900 } from "./migrations/1793990506900-migration";

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
  migrations: ["src/modules/caelundas-database/migrations/*.ts"],
  project: CAELUNDAS_PROJECT,
});
