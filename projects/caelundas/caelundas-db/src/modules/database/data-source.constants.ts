import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Migration1795725171000 } from "../../../migrations/1795725171000-migration";

import { DATABASE_PROJECT } from "./database.constants";
import { CalendarEventTag } from "./modules/calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "./modules/calendar-events/calendar-event.entity";
import { Measure } from "./modules/metric-catalog/measure.entity";
import { MetricExpression } from "./modules/metric-catalog/metric-expression.entity";
import { Metric } from "./modules/metric-catalog/metric.entity";
import { CalendarEventFact } from "./modules/metrics/calendar-event-fact.entity";
import { CalendarEventTagSet } from "./modules/metrics/calendar-event-tag-set.entity";
import { DimensionEdge } from "./modules/metrics/dimension-edge.entity";
import { Dimension } from "./modules/metrics/dimension.entity";
import { Filter } from "./modules/metrics/filter.entity";
import { GroupDimension } from "./modules/metrics/group-dimension.entity";
import { Group } from "./modules/metrics/group.entity";
import { ConstellationEdge } from "./modules/night-sky/constellation-edge.entity";
import { Constellation } from "./modules/night-sky/constellation.entity";
import { Star } from "./modules/night-sky/star.entity";
import { TagTree } from "./modules/tags/tag-tree.entity";
import { Tag } from "./modules/tags/tag.entity";

/** Tables and views shared by every caelundas-schema app. */
export const DATABASE_ENTITIES = [
  CalendarEvent,
  CalendarEventFact,
  CalendarEventTag,
  CalendarEventTagSet,
  Dimension,
  DimensionEdge,
  Filter,
  Group,
  GroupDimension,
  Measure,
  Metric,
  MetricExpression,
  Constellation,
  ConstellationEdge,
  Star,
  Tag,
  TagTree,
] as const;

/** All migrations in order, for tests; the runtime runs none. */
export const CAELUNDAS_DATABASE_MIGRATIONS = [Migration1795725171000] as const;

/** TypeORM CLI data source; reads only `CAELUNDAS_POSTGRES_*`, never syncs. */
export const databaseDataSource = createDataSource({
  entities: [...DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: DATABASE_PROJECT,
});
