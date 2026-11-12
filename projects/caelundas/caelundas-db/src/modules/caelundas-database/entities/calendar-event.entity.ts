import { Column, Entity, Index, Unique } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

import {
  COORDINATE_PRECISION,
  COORDINATE_SCALE,
} from "../caelundas-database.constants";
import {
  createCoordinateTransformer,
  createMomentTransformer,
} from "../caelundas-database.utilities";

import type { Moment } from "moment-timezone";

/**
 * One row of the `calendar_events` table: a single astronomical event as detected for one observer location, upserted on its natural key.
 */
@Entity()
@Index("calendar_events_start_end", ["start", "end"])
@Unique("calendar_events_natural_key", [
  "summary",
  "start",
  "end",
  "latitude",
  "longitude",
])
export class CalendarEvent extends PostgresqlUpdatableEntity {
  @Column("text", { nullable: true })
  color?: null | string;

  @Column("text")
  description!: string;

  @Column("timestamptz", { transformer: createMomentTransformer() })
  end!: Moment;

  @Column("numeric", {
    precision: COORDINATE_PRECISION,
    scale: COORDINATE_SCALE,
    transformer: createCoordinateTransformer(),
  })
  latitude!: string;

  @Column("text", { nullable: true })
  location?: null | string;

  @Column("numeric", {
    precision: COORDINATE_PRECISION,
    scale: COORDINATE_SCALE,
    transformer: createCoordinateTransformer(),
  })
  longitude!: string;

  @Column("timestamptz", { transformer: createMomentTransformer() })
  start!: Moment;

  @Column("text")
  summary!: string;

  @Column("text")
  timezone!: string;
}
