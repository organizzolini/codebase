import "reflect-metadata";

import { createDataSource, withGeneratedEdges } from "@codebase/persistence";

import { Migration1793990506900 } from "../../../migrations/1793990506900-migration";
import { Migration1795466077000 } from "../../../migrations/1795466077000-migration";
import { Migration1795532000000 } from "../../../migrations/1795532000000-migration";
import { Migration1795568633626 } from "../../../migrations/1795568633626-migration";

import { DATABASE_PROJECT } from "./database.constants";
import { CalendarEventDerivedTime } from "./modules/calendar-events/calendar-event-derived-time.entity";
import { CalendarEventTagNode } from "./modules/calendar-events/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./modules/calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "./modules/calendar-events/calendar-event.entity";
import { CalendarEventDayRollup } from "./modules/metrics/calendar-event-day-rollup.entity";
import { CalendarEventDayTagNameRollup } from "./modules/metrics/calendar-event-day-tag-name-rollup.entity";
import { CalendarEventDayTagRollup } from "./modules/metrics/calendar-event-day-tag-rollup.entity";
import { CalendarEventFact } from "./modules/metrics/calendar-event-fact.entity";
import { Constellation } from "./modules/night-sky/constellation.entity";
import { Star } from "./modules/night-sky/star.entity";
import { TagNode } from "./modules/tags/tag-node.entity";
import { Tag } from "./modules/tags/tag.entity";

/** The night sky's tables, with the `ConstellationEdge` its `@Graph` generates. */
const NIGHT_SKY_ENTITIES = withGeneratedEdges([Constellation, Star]);

/** Tables, derived tables, and view shared by every caelundas-schema app. */
export const DATABASE_ENTITIES = [
  CalendarEvent,
  CalendarEventDayRollup,
  CalendarEventDayTagNameRollup,
  CalendarEventDayTagRollup,
  CalendarEventDerivedTime,
  CalendarEventFact,
  CalendarEventTag,
  CalendarEventTagNode,
  ...NIGHT_SKY_ENTITIES,
  Tag,
  TagNode,
] as const;

/** All migrations in order, for tests; the runtime runs none. */
export const CAELUNDAS_DATABASE_MIGRATIONS = [
  Migration1793990506900,
  Migration1795466077000,
  Migration1795532000000,
  Migration1795568633626,
] as const;

/** TypeORM CLI data source; reads only `CAELUNDAS_POSTGRES_*`, never syncs. */
export const databaseDataSource = createDataSource({
  entities: [...DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: DATABASE_PROJECT,
});
