import "reflect-metadata";

import path from "node:path";

import { createDataSource, withGeneratedEdges } from "@codebase/persistence";

import { DATABASE_PROJECT } from "./database.constants";
import { CalendarEventDerivedTime } from "./modules/calendar-events/calendar-event-derived-time.entity";
import { CalendarEventTagNode } from "./modules/calendar-events/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./modules/calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "./modules/calendar-events/calendar-event.entity";
import { Constellation } from "./modules/night-sky/constellation.entity";
import { Star } from "./modules/night-sky/star.entity";
import { TagNode } from "./modules/tags/tag-node.entity";
import { Tag } from "./modules/tags/tag.entity";

/** The night sky's tables, with the `ConstellationEdge` its `@Graph` generates. */
const NIGHT_SKY_ENTITIES = withGeneratedEdges([Constellation, Star]);

/** Tables, derived tables, and view shared by every caelundas-schema app. */
export const DATABASE_ENTITIES = [
  CalendarEvent,
  CalendarEventDerivedTime,
  CalendarEventTag,
  CalendarEventTagNode,
  ...NIGHT_SKY_ENTITIES,
  Tag,
  TagNode,
] as const;

// TypeScript in the source tree, JavaScript where a build writes them.
/** The migrations folder's files. */
export const CAELUNDAS_DATABASE_MIGRATIONS = [
  path.join(import.meta.dirname, "../../../migrations/*-migration.{js,ts}"),
] as const;

// Run from this folder; reads only `CAELUNDAS_POSTGRES_*` and never syncs.
/** TypeORM CLI data source. */
export const databaseDataSource = createDataSource({
  entities: [...DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: DATABASE_PROJECT,
});
