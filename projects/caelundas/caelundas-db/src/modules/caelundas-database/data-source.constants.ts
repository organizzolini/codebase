import "reflect-metadata";

import { createDataSource, withGeneratedEdges } from "@codebase/persistence";

import { Migration1793990506900 } from "../../../migrations/1793990506900-migration";

import { CAELUNDAS_PROJECT } from "./caelundas-database.constants";
import { CalendarEventDerivedTime } from "./modules/calendar-events/calendar-event-derived-time.entity";
import { CalendarEventTagNode } from "./modules/calendar-events/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./modules/calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "./modules/calendar-events/calendar-event.entity";
import { Constellation } from "./modules/night-sky/constellation.entity";
import { Star } from "./modules/night-sky/star.entity";
import { TagNode } from "./modules/tags/tag-node.entity";
import { Tag } from "./modules/tags/tag.entity";

/** Every caelundas-schema entity, with the `ConstellationEdge` generated. */
export const CAELUNDAS_DATABASE_ENTITIES = withGeneratedEdges([
  CalendarEvent,
  CalendarEventDerivedTime,
  CalendarEventTag,
  CalendarEventTagNode,
  Constellation,
  Star,
  Tag,
  TagNode,
]);

/** All migrations in order, for tests; the runtime runs none. */
export const CAELUNDAS_DATABASE_MIGRATIONS = [Migration1793990506900] as const;

/** TypeORM CLI data source; reads only `CAELUNDAS_POSTGRES_*`, never syncs. */
export const caelundasDataSource = createDataSource({
  entities: [...CAELUNDAS_DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: CAELUNDAS_PROJECT,
});
