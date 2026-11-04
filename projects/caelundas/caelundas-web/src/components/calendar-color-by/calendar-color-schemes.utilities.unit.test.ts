import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";
import { createEventGroupFields } from "../calendar-group-by/event-group-fields.utilities";

import { COLOR_PALETTE } from "./calendar-color-schemes.constants";
import { createColorScheme } from "./calendar-color-schemes.utilities";
import { EVENT_COLOR_RULES } from "./calendar-colors.constants";

import type { CalendarEventRecord } from "../events-calendar/events-database.types";

const FIELDS = createEventGroupFields(
  await createTestEventsDatabase().findFacets(),
);

function event(
  keys: readonly string[],
  color: null | string = null,
): CalendarEventRecord {
  return {
    color,
    description: "",
    durationMinutes: 0,
    end: new Date("2026-03-01T00:00:00Z"),
    groups: [keys.map((key) => ({ key, label: key, path: null }))],
    id: "event",
    location: null,
    start: new Date("2026-03-01T00:00:00Z"),
    summary: "Event",
    tags: [],
    timezone: "UTC",
  };
}

describe(createColorScheme, () => {
  it("colors by type, kind by kind, without a level", () => {
    const scheme = createColorScheme(undefined, FIELDS, 0);

    expect(scheme.legend).toHaveLength(EVENT_COLOR_RULES.length);
    expect(scheme.legend[0]).toStrictEqual({
      color: EVENT_COLOR_RULES[0]?.color,
      key: EVENT_COLOR_RULES[0]?.path,
      label: EVENT_COLOR_RULES[0]?.label,
    });
  });

  it("falls back to the default for a field the data lacks", () => {
    expect(
      createColorScheme({ field: "tag:tag-missing" }, FIELDS, 0).legend,
    ).toHaveLength(EVENT_COLOR_RULES.length);
  });

  it("gives each tag at a depth beneath a root a color of its own, in the tree's order", () => {
    const scheme = createColorScheme(
      { depth: 1, field: "tag:tag-planet" },
      FIELDS,
      0,
    );

    expect(scheme.legend.map((entry) => entry.label)).toStrictEqual([
      "Mars",
      "Mercury",
      "Saturn",
      "Sun",
      "Venus",
    ]);
    expect(scheme.legend.map((entry) => entry.color)).toStrictEqual(
      COLOR_PALETTE.slice(0, 5),
    );
  });

  it("colors an event by its tag, or by the first of its tags in the legend's order", () => {
    const scheme = createColorScheme(
      { depth: 1, field: "tag:tag-planet" },
      FIELDS,
      0,
    );

    expect(scheme.colorOf(event(["tag-venus"]))).toBe(COLOR_PALETTE[4]);
    expect(scheme.colorOf(event(["tag-venus", "tag-mars"]))).toBe(
      COLOR_PALETTE[0],
    );
  });

  it("keeps the color the data gave an event with no value in the legend", () => {
    const scheme = createColorScheme(
      { depth: 1, field: "tag:tag-planet" },
      FIELDS,
      0,
    );

    expect(scheme.colorOf(event([], "#123456"))).toBe("#123456");
    expect(scheme.colorOf(event(["tag-other"]))).toBeNull();
  });

  it("colors only the tags picked, when some are", () => {
    const scheme = createColorScheme(
      { field: "tag:tag-planet", tags: ["tag-venus"] },
      FIELDS,
      0,
    );

    expect(scheme.legend.map((entry) => entry.label)).toStrictEqual(["Venus"]);
    expect(scheme.legend[0]?.color).toBe(COLOR_PALETTE[0]);
  });

  it("lists the weekdays, the hours and the durations ahead, a color each", () => {
    const weekday = createColorScheme({ field: "weekday" }, FIELDS, 0);
    const hour = createColorScheme({ field: "hour" }, FIELDS, 0);
    const duration = createColorScheme({ field: "duration" }, FIELDS, 0);

    expect(weekday.legend.map((entry) => entry.label)).toContain("Wednesday");
    expect(weekday.colorOf(event(["3"]))).toBe(weekday.legend[3]?.color);
    expect(hour.legend).toHaveLength(24);
    expect(duration.legend.map((entry) => entry.key)).toContain("instant");
  });

  it("colors a period by its own text, the same each time, with no legend", () => {
    const scheme = createColorScheme({ field: "month" }, FIELDS, 0);

    expect(scheme.legend).toStrictEqual([]);
    expect(scheme.colorOf(event(["2026-03"]))).toBe(
      scheme.colorOf(event(["2026-03"])),
    );
    expect(COLOR_PALETTE).toContain(scheme.colorOf(event(["2026-03"])));
    expect(scheme.colorOf(event([], "#123456"))).toBe("#123456");
  });

  it("reads the keys at the index it is given", () => {
    const scheme = createColorScheme(
      { depth: 1, field: "tag:tag-planet" },
      FIELDS,
      1,
    );
    const colored = event(["tag-mars"]);

    expect(scheme.colorOf(colored)).toBeNull();
    expect(
      scheme.colorOf({ ...colored, groups: [[], ...colored.groups] }),
    ).toBe(COLOR_PALETTE[0]);
  });

  it("colors the first level of a tag root when no depth is given", () => {
    const scheme = createColorScheme({ field: "tag:tag-planet" }, FIELDS, 0);

    expect(scheme.legend.map((entry) => entry.label)).toContain("Mars");
  });
});
