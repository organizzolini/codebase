import { Column, Entity, Unique } from "typeorm";

import { UpdatableEntity } from "@codebase/persistence";

import { createMomentTransformer } from "../database.utilities";

import type { Moment } from "moment-timezone";

/**
 * One row of the `calendar_events` table, in the schema that
 * `CAELUNDAS_POSTGRES_SCHEMA` names: a single astronomical event as detected
 * for one observer location.
 *
 * An event is identified by its natural key, the summary, start, latitude,
 * and longitude together: a run for the same place that detects the same
 * event again updates the row it already wrote, and a run for a second place
 * adds rows of its own, even for an event the sky shows everywhere. Latitude
 * and longitude are `numeric` rather than floating point so that key compares
 * exactly; `pg` returns a `numeric` as a string, so read them as such.
 *
 * `start` and `end` are equal for an instantaneous event, and are carried as
 * `Moment`s, read back in UTC, through {@link createMomentTransformer}: they
 * stay instants, and `timezone` names the IANA zone of the observer location,
 * derived from its latitude and longitude, for a reader to render local time
 * in. `color` and `location` are optional as well as nullable, so a detector
 * may leave them out.
 *
 * An event's tags are not a column: each is a row of `calendar_event_tags`
 * linking it to a node of the `tags` tree.
 */
@Entity({ name: "calendar_events" })
@Unique("calendar_events_natural_key", [
  "summary",
  "start",
  "latitude",
  "longitude",
])
export class CalendarEvent extends UpdatableEntity {
  @Column("text", {
    comment: "Color hint for calendar display",
    nullable: true,
  })
  color?: null | string;

  @Column("text", { comment: "Detailed description with additional context" })
  description!: string;

  @Column("timestamptz", {
    comment: "When the event ends",
    name: "end",
    transformer: createMomentTransformer(),
  })
  end!: Moment;

  @Column("numeric", {
    comment: "Observer latitude in degrees the event was computed for",
    precision: 8,
    scale: 6,
  })
  latitude!: string;

  @Column("text", {
    comment: "Human-readable location of the event",
    nullable: true,
  })
  location?: null | string;

  @Column("numeric", {
    comment: "Observer longitude in degrees the event was computed for",
    precision: 9,
    scale: 6,
  })
  longitude!: string;

  @Column("timestamptz", {
    comment: "When the event starts",
    name: "start",
    transformer: createMomentTransformer(),
  })
  start!: Moment;

  @Column("text", { comment: "Brief event title shown in calendar views" })
  summary!: string;

  @Column("text", {
    comment: "IANA timezone of the observer location, such as America/New_York",
  })
  timezone!: string;
}
