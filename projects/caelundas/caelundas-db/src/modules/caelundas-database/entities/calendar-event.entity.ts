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
 * One row of the `calendar_events` table: a single astronomical event as
 * detected for one observer location.
 *
 * The id is a `uuidv7` the database assigns, and an event is identified by its
 * natural key, the summary, start, end, latitude, and longitude together: a
 * run for the same place that detects the same event again upserts on
 * `calendar_events_natural_key` and updates the row it already wrote, and a
 * run for a second place adds rows of its own, even for an event the sky
 * shows everywhere. Latitude and longitude are `numeric` with six decimals,
 * rather than floating point, so that key compares exactly.
 *
 * `start` and `end` are `timestamptz` instants, equal for an instantaneous
 * event, carried as `Moment`s, read back in UTC, through
 * {@link createMomentTransformer}. `timezone` names the IANA zone of the
 * observer location, derived from its latitude and longitude, for a reader to
 * render local time in. `color` and `location` are optional as well as
 * nullable, so a detector may leave them out.
 *
 * An event's tags are not a column: each is a row of `calendar_event_tags`
 * linking it to a node of the `tags` tree.
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
