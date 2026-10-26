import { Column, Entity, Unique } from "typeorm";

import { SqliteUpdatableEntity } from "@codebase/persistence";

import { createMomentTransformer } from "../database.utilities";

import type { Moment } from "moment-timezone";

/**
 * One row of the `calendar_events` table in the caelundas SQLite file: a
 * single astronomical event as detected for one observer location.
 *
 * An event is identified by its natural key, the summary, start, latitude,
 * and longitude together: a run for the same place that detects the same
 * event again updates the row it already wrote, and a run for a second place
 * adds rows of its own, even for an event the sky shows everywhere. Latitude
 * and longitude are `text`, fixed to six decimals, rather than floating point
 * so that key compares exactly.
 *
 * `start` and `end` are equal for an instantaneous event. They are stored as
 * ISO 8601 text in UTC, such as `2026-03-04T15:20:00.000Z`, which sorts and
 * compares as the instants it names, and are carried as `Moment`s, read back
 * in UTC, through {@link createMomentTransformer}: they stay instants, and
 * `timezone` names the IANA zone of the observer location, derived from its
 * latitude and longitude, for a reader to render local time in. `color` and `location` are optional as well as nullable, so a detector
 * may leave them out.
 *
 * An event's tags are not a column: each is a row of `calendar_event_tags`
 * linking it to a node of the `tags` tree.
 */
@Entity({ name: "calendar_events" })
@Unique("calendar_events_natural_key", [
  "summary",
  "start",
  "end",
  "latitude",
  "longitude",
])
export class CalendarEvent extends SqliteUpdatableEntity {
  @Column("text", { nullable: true })
  color?: null | string;

  @Column("text")
  description!: string;

  @Column("text", { name: "end", transformer: createMomentTransformer() })
  end!: Moment;

  @Column("text")
  latitude!: string;

  @Column("text", { nullable: true })
  location?: null | string;

  @Column("text")
  longitude!: string;

  @Column("text", { name: "start", transformer: createMomentTransformer() })
  start!: Moment;

  @Column("text")
  summary!: string;

  @Column("text")
  timezone!: string;
}
