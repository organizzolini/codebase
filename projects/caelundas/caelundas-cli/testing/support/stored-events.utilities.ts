import type { StoredEvent, StoredEventsRange } from "./stored-events.types";
import type { DataSource } from "typeorm";

/**
 * Stored events at one location overlapping a range, by start then name, each with its directly linked tag names ordered by code point.
 */
export async function findStoredEvents(
  dataSource: DataSource,
  range: StoredEventsRange,
): Promise<StoredEvent[]> {
  return dataSource.query<StoredEvent[]>(
    `select e.name as summary,
        coalesce(
          array_agg(distinct t.name collate "C")
            filter (where t.name is not null),
          '{}'
        ) as tags
      from calendar_events as e
      left join calendar_event_tags as l on l.calendar_event_id = e.id
      left join tags as t on t.id = l.tag_id
      where e.latitude = $1
        and e.longitude = $2
        and e."start" < $3
        and (e."end" > $4 or (e."end" = e."start" and e."start" >= $4))
      group by e.id
      order by e."start", e.name`,
    [
      range.latitude.toFixed(6),
      range.longitude.toFixed(6),
      range.end.toISOString(),
      range.start.toISOString(),
    ],
  );
}
