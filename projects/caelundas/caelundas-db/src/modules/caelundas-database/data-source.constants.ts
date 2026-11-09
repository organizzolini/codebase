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

/** The tables, derived tables and view every application that opens the caelundas schema shares. */
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

/** Every migration, in order, for the test harness; the runtime module runs none. */
export const CAELUNDAS_DATABASE_MIGRATIONS = [Migration1793990506900] as const;

/**
 * Data source for the TypeORM CLI, built from the runtime options; reads only `CAELUNDAS_POSTGRES_*`, never synchronizes.
 */
export const caelundasDataSource = createDataSource({
  entities: [...CAELUNDAS_DATABASE_ENTITIES],
  migrations: ["src/modules/caelundas-database/migrations/*.ts"],
  project: CAELUNDAS_PROJECT,
});
