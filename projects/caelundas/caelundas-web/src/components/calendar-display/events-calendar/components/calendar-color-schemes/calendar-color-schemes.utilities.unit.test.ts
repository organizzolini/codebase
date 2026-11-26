import { beforeAll, describe, expect, it } from "vitest";

import { findFixtureFacets } from "../../../../../../testing/calendar-facets";
import {
  createEventGroupFields,
  getDefaultGrouping,
} from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { EVENT_COLOR_RULES } from "../calendar-colors/calendar-colors.constants";

import { COLOR_PALETTE } from "./calendar-color-schemes.constants";
import { createColorScheme } from "./calendar-color-schemes.utilities";

import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

let FIELDS: ReturnType<typeof createEventGroupFields> = [];

function event(
  tagIds: readonly string[],
  keys: readonly string[] = [],
  color: null | string = null,
): CalendarEventRecord {
  return {
    color,
    durationMinutes: 0,
    end: new Date("2026-03-01T00:00:00Z"),
    groups: [keys.map((key) => ({ key, label: key, path: null }))],
    id: "event",
    name: "Event",
    note: "",
    start: new Date("2026-03-01T00:00:00Z"),
    tags: tagIds.map((id, depth) => ({
      depth,
      id,
      name: id,
      path: id,
    })),
    timezone: "UTC",
  };
}

describe(createColorScheme, () => {
  beforeAll(async () => {
    FIELDS = createEventGroupFields(await findFixtureFacets());
  });

  it("colors by event kind, kind by kind, with no grouping", () => {
    const scheme = createColorScheme([], FIELDS);

    expect(scheme.legend).toHaveLength(EVENT_COLOR_RULES.length);
    expect(scheme.legend[0]).toStrictEqual({
      color: EVENT_COLOR_RULES[0]?.color,
      depth: 0,
      key: EVENT_COLOR_RULES[0]?.path,
      label: EVENT_COLOR_RULES[0]?.label,
    });
  });

  it("falls back to the event kind for a field the data lacks", () => {
    expect(
      createColorScheme([{ field: "tag:tag-missing" }], FIELDS).legend,
    ).toHaveLength(EVENT_COLOR_RULES.length);
  });

  it("gives each tag at a depth beneath a root a palette color of its own, in the tree's order", () => {
    const scheme = createColorScheme(
      [{ depth: 1, field: "tag:tag-body" }],
      FIELDS,
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

  it("colors an event by its tag", () => {
    const scheme = createColorScheme(
      [{ depth: 1, field: "tag:tag-body" }],
      FIELDS,
    );

    expect(scheme.colorOf(event(["tag-body", "tag-venus"]))).toBe(
      COLOR_PALETTE[4],
    );
  });

  it("colors by tag root under the default grouping, the tags beneath each root in shades of it", () => {
    const scheme = createColorScheme(getDefaultGrouping(FIELDS), FIELDS);

    expect(scheme.legend.filter((entry) => entry.depth === 0)).toHaveLength(
      FIELDS.filter((field) => field.id.startsWith("tag:")).length,
    );
    expect(scheme.legend[0]).toMatchObject({
      color: COLOR_PALETTE[0],
      depth: 0,
    });
    expect(scheme.legend[1]).toMatchObject({ depth: 1, label: "Simple" });
    expect(scheme.colorOf(event(["tag-venus"]))).toBe(
      scheme.legend.find((entry) => entry.label === "Venus")?.color,
    );
    expect(scheme.colorOf(event(["tag-body"]))).toBe(
      scheme.legend.find((entry) => entry.label === "Body")?.color,
    );
  });

  it("colors an event by the first root it has a tag of, and none by none", () => {
    const scheme = createColorScheme(getDefaultGrouping(FIELDS), FIELDS);

    expect(scheme.colorOf(event(["tag-venus", "tag-simple"]))).toBe(
      scheme.legend.find((entry) => entry.label === "Simple")?.color,
    );
    expect(scheme.colorOf(event(["tag-missing"]))).toBeNull();
  });

  it("nests colors: tags beneath a group's tag take colors near it, indented in the legend", () => {
    const scheme = createColorScheme(
      [{ depth: 1, field: "tag:tag-aspect" }],
      FIELDS,
    );
    const colorOfTag = (label: string): string | undefined =>
      scheme.legend.find((entry) => entry.label === label)?.color;

    expect(
      scheme.legend.map((entry) => [entry.label, entry.depth]),
    ).toStrictEqual([
      ["Simple", 0],
      ["Major", 1],
      ["Conjunct", 2],
      ["Square", 2],
    ]);
    expect(colorOfTag("Simple")).toBe(COLOR_PALETTE[0]);
    expect(colorOfTag("Major")).toMatch(/^oklch\(/);
    expect(colorOfTag("Conjunct")).not.toBe(colorOfTag("Square"));
  });

  it("takes the color of an event's deepest colored tag, falling outward to its ancestors", () => {
    const scheme = createColorScheme(
      [{ depth: 1, field: "tag:tag-aspect" }],
      FIELDS,
    );
    const colorOfTag = (label: string): string | undefined =>
      scheme.legend.find((entry) => entry.label === label)?.color;

    expect(
      scheme.colorOf(
        event(["tag-aspect", "tag-simple", "tag-major", "tag-conjunct"]),
      ),
    ).toBe(colorOfTag("Conjunct"));
    expect(
      scheme.colorOf(event(["tag-aspect", "tag-simple", "tag-major"])),
    ).toBe(colorOfTag("Major"));
    expect(scheme.colorOf(event(["tag-aspect", "tag-simple"]))).toBe(
      COLOR_PALETTE[0],
    );
  });

  it("keeps an event's kind color when it has no tag in the field colored by, and ignores any color it carries", () => {
    const scheme = createColorScheme(
      [{ depth: 1, field: "tag:tag-body" }],
      FIELDS,
    );
    const ingress = {
      ...event(["tag-other"]),
      tags: [
        { depth: 2, id: "ingress", name: "Ingress", path: "Zodiac / Ingress" },
      ],
    };

    expect(scheme.colorOf(ingress)).toBe("#10b981");
    expect(scheme.colorOf(event([], [], "#123456"))).toBeNull();
    expect(scheme.colorOf(event(["tag-other"]))).toBeNull();
  });

  it("colors only the tags picked, when some are", () => {
    const scheme = createColorScheme(
      [{ field: "tag:tag-body", tags: ["tag-venus"] }],
      FIELDS,
    );

    expect(scheme.legend.map((entry) => entry.label)).toStrictEqual(["Venus"]);
    expect(scheme.legend[0]?.color).toBe(COLOR_PALETTE[0]);
  });

  it("falls to a later level's field for an event the first level has no tag for", () => {
    const scheme = createColorScheme(
      [
        { depth: 1, field: "tag:tag-aspect" },
        { depth: 1, field: "tag:tag-body" },
      ],
      FIELDS,
    );

    expect(scheme.colorOf(event(["tag-venus"]))).toBe(COLOR_PALETTE[1 + 4]);
    expect(scheme.colorOf(event(["tag-simple"]))).toBe(COLOR_PALETTE[0]);
  });

  it("lists the weekdays, the hours and the durations ahead, a color each", () => {
    const weekday = createColorScheme([{ field: "weekday" }], FIELDS);
    const hour = createColorScheme([{ field: "hour" }], FIELDS);
    const duration = createColorScheme([{ field: "duration" }], FIELDS);

    expect(weekday.legend.map((entry) => entry.label)).toContain("Wednesday");
    expect(weekday.colorOf(event([], ["3"]))).toBe(weekday.legend[3]?.color);
    expect(hour.legend).toHaveLength(24);
    expect(duration.legend.map((entry) => entry.key)).toContain("instant");
  });

  it("colors a period by its own text, the same each time, with no legend", () => {
    const scheme = createColorScheme([{ field: "month" }], FIELDS);

    expect(scheme.legend).toStrictEqual([]);
    expect(scheme.colorOf(event([], ["2026-03"]))).toBe(
      scheme.colorOf(event([], ["2026-03"])),
    );
    expect(COLOR_PALETTE).toContain(scheme.colorOf(event([], ["2026-03"])));
  });

  it("reads a derived field's keys at the index of its level", () => {
    const scheme = createColorScheme(
      [{ depth: 1, field: "tag:tag-body" }, { field: "weekday" }],
      FIELDS,
    );
    const colored = event([], ["3"]);

    expect(scheme.colorOf(colored)).toBeNull();
    expect(
      scheme.colorOf({ ...colored, groups: [[], ...colored.groups] }),
    ).toBe(createColorScheme([{ field: "weekday" }], FIELDS).legend[3]?.color);
  });

  it("colors the first level of a tag root when no depth is given", () => {
    const scheme = createColorScheme([{ field: "tag:tag-body" }], FIELDS);

    expect(scheme.legend.map((entry) => entry.label)).toContain("Mars");
  });
});
