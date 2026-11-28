import { Column, Entity, Index, Unique } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

import {
  COORDINATE_PRECISION,
  COORDINATE_SCALE,
} from "../../database.constants";
import {
  createCoordinateTransformer,
  createMomentTransformer,
} from "../../database.utilities";

import type { Moment } from "moment-timezone";

/**
 * One row of the `calendar_events` table: a single astronomical event as detected for one observer location, upserted on its natural key.
 */
@Entity()
@Index("calendar_events_start_end", ["start", "end"])
@Index("calendar_events_end", ["end"])
@Index("calendar_events_start_local_day", ["startLocalDay"])
@Index("calendar_events_location_start", ["latitude", "longitude", "start"])
@Unique("calendar_events_natural_key", [
  "name",
  "start",
  "end",
  "latitude",
  "longitude",
])
export class CalendarEvent extends PostgresqlUpdatableEntity {
  @Column("timestamptz", { transformer: createMomentTransformer() })
  end!: Moment;

  /** The local day it ends, computed by the database. */
  @Column({
    asExpression: `("end" AT TIME ZONE timezone)::date`,
    generatedType: "STORED",
    insert: false,
    type: "date",
    update: false,
  })
  endLocalDay!: string;

  @Column("numeric", {
    precision: COORDINATE_PRECISION,
    scale: COORDINATE_SCALE,
    transformer: createCoordinateTransformer(),
  })
  latitude!: string;

  @Column("numeric", {
    precision: COORDINATE_PRECISION,
    scale: COORDINATE_SCALE,
    transformer: createCoordinateTransformer(),
  })
  longitude!: string;

  /** What happened, such as `Mars Retrograde`; part of the natural key. */
  @Column("text")
  name!: string;

  /** A sentence or so of detail about it. */
  @Column("text")
  note!: string;

  @Column("timestamptz", { transformer: createMomentTransformer() })
  start!: Moment;

  /** The local day it starts, computed by the database. */
  @Column({
    asExpression: `("start" AT TIME ZONE timezone)::date`,
    generatedType: "STORED",
    insert: false,
    type: "date",
    update: false,
  })
  startLocalDay!: string;

  /** The local hour it starts, 0 to 23; computed. */
  @Column({
    asExpression: `EXTRACT(HOUR FROM "start" AT TIME ZONE timezone)::smallint`,
    generatedType: "STORED",
    insert: false,
    type: "smallint",
    update: false,
  })
  startLocalHour!: number;

  @Column("text")
  timezone!: string;
}
