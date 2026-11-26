import { describe, expect, it } from "vitest";

import { listDayEvents } from "./calendar-overflow-list.utilities";

import type { CalendarEventRecord } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

function event(
  id: string,
  name: string,
  start: string,
  end = start,
): CalendarEventRecord {
  return {
    color: null,
    durationMinutes: 0,
    end: new Date(end),
    groups: [],
    id,
    name,
    note: "",
    start: new Date(start),
    tags: [],
    timezone: "UTC",
  };
}

describe(listDayEvents, () => {
  it("orders events that begin together by name", () => {
    const rows = listDayEvents(
      [
        event("b", "Venus", "2026-03-04T10:00:00.000Z"),
        event("a", "Mars", "2026-03-04T10:00:00.000Z"),
      ],
      "2026-03-04",
      "UTC",
    );

    expect(rows.map(({ record }) => record.id)).toStrictEqual(["a", "b"]);
  });

  it("lists an event under way when the day began as ongoing, and leaves out another day's", () => {
    const rows = listDayEvents(
      [
        event(
          "long",
          "Long",
          "2026-03-01T10:00:00.000Z",
          "2026-03-20T10:00:00.000Z",
        ),
        event("other", "Other", "2026-03-09T10:00:00.000Z"),
      ],
      "2026-03-04",
      "UTC",
    );

    expect(rows).toMatchObject([{ ongoing: true, record: { id: "long" } }]);
  });
});
