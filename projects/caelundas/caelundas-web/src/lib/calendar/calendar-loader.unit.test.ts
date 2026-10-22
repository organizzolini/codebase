import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";
import { EMPTY_EVENT_FILTER } from "../event-filters/event-filter-tree";

import { loadCalendar } from "./calendar-loader";

// The seed lacks the long cycles the default collection keeps, so one is
// added and given to a single event.
const STATION_SQL = `
  insert into tags (id, created_at, updated_at, "name", parent_id) values
    ('tag-station', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Station', 'tag-type');
  insert into tags_closure (ancestor_id, descendant_id) values
    ('tag-station', 'tag-station'),
    ('tag-type', 'tag-station');
  insert into calendar_event_tags (calendar_event_id, tag_id) values
    ('event-mercury-retrograde', 'tag-station');
`;
const MARCH = { date: "2026-03-15", view: "month" } as const;

describe(loadCalendar, () => {
  it("opens on the default collection when the link names no filter", async () => {
    const data = await loadCalendar(
      createTestEventsDatabase({ extraSql: STATION_SQL }),
      MARCH,
    );

    expect(data.filtered).toBe(true);
    expect(data.filter?.rules).toHaveLength(1);
    expect(data.events.map((event) => event.id)).toStrictEqual([
      "event-mercury-retrograde",
    ]);
  });

  it("shows every event when the link holds an empty filter", async () => {
    const data = await loadCalendar(
      createTestEventsDatabase({ extraSql: STATION_SQL }),
      { ...MARCH, filter: EMPTY_EVENT_FILTER },
    );

    expect(data.filtered).toBe(false);
    expect(data.events.length).toBeGreaterThan(1);
  });

  it("applies no filter when the data has none of the default's tags", async () => {
    const data = await loadCalendar(createTestEventsDatabase(), MARCH);

    expect(data.filter).toBeUndefined();
    expect(data.filtered).toBe(false);
  });
});
