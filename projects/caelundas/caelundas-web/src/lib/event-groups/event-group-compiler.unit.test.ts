import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

import { compileEventGrouping } from "./event-group-compiler";

import type { EventGrouping } from "./event-groups.types";

const seeded = createTestEventsDatabase();

const WHOLE_SEED = {
  end: new Date("2027-01-01T00:00:00.000Z"),
  start: new Date("2026-01-01T00:00:00.000Z"),
};

/**
 * Each seeded event's group keys at every level of a grouping, by event id.
 */
async function findGroupKeys(
  grouping: EventGrouping,
): Promise<Record<string, string[][]>> {
  const events = await seeded.findEvents({
    groups: compileEventGrouping(grouping),
    window: WHOLE_SEED,
  });

  return Object.fromEntries(
    events.map((event) => [
      event.id,
      event.groups.map((keys) => keys.map(({ key }) => key).toSorted()),
    ]),
  );
}

describe(compileEventGrouping, () => {
  it("groups by a tag root's children", async () => {
    const keys = await findGroupKeys([{ depth: 1, field: "tag:tag-type" }]);

    expect(keys).toMatchObject({
      "event-mars-conjunct-venus": [["tag-aspect"]],
      "event-mercury-retrograde": [["tag-retrograde"]],
      "event-sun-ingress-aries": [["tag-ingress"]],
    });
  });

  it("puts an event in every group of the dimension it carries", async () => {
    const keys = await findGroupKeys([{ depth: 1, field: "tag:tag-planet" }]);

    expect(keys["event-mars-conjunct-venus"]).toStrictEqual([
      ["tag-mars", "tag-venus"],
    ]);
  });

  it("groups by a root's children when no depth is given", async () => {
    const keys = await findGroupKeys([{ field: "tag:tag-type" }]);

    expect(keys["event-mars-square-saturn"]).toStrictEqual([["tag-aspect"]]);
  });

  it("goes down to the depth asked for", async () => {
    const keys = await findGroupKeys([{ depth: 2, field: "tag:tag-type" }]);

    expect(keys["event-mars-square-saturn"]).toStrictEqual([
      ["tag-major-aspect"],
    ]);
  });

  it("falls back to an event's own leaf beyond the end of its branch", async () => {
    const keys = await findGroupKeys([{ depth: 3, field: "tag:tag-type" }]);

    expect(keys).toMatchObject({
      "event-mars-square-saturn": [["tag-square"]],
      "event-sun-ingress-aries": [["tag-ingress"]],
    });
  });

  it("leaves an event with no tag in the dimension in no group", async () => {
    const keys = await findGroupKeys([{ depth: 1, field: "tag:tag-sign" }]);

    expect(keys).toMatchObject({
      "event-mercury-retrograde": [[]],
      "event-sun-ingress-aries": [["tag-aries"]],
    });
  });

  it.each([
    { field: "year", key: "2026" },
    { field: "quarter", key: "2026-Q1" },
    { field: "month", key: "2026-03" },
    { field: "week", key: "2026-03-22" },
    { field: "day", key: "2026-03-25" },
    { field: "weekday", key: "3" },
    { field: "hour", key: "23" },
    { field: "duration", key: "instant" },
  ])(
    "groups by the local $field an event starts in",
    async ({ field, key }) => {
      // Venus enters Aries at 03:12 UTC on the 26th, 11:12 PM on Wednesday the
      // 25th in New York.
      const keys = await findGroupKeys([{ field }]);

      expect(keys["event-venus-ingress-aries"]).toStrictEqual([[key]]);
    },
  );

  it("buckets a span by how long it lasts", async () => {
    const keys = await findGroupKeys([{ field: "duration" }]);

    expect(keys["event-mercury-retrograde"]).toStrictEqual([["weeks"]]);
  });

  it("reads one level of keys per level of the grouping", async () => {
    const keys = await findGroupKeys([
      { depth: 1, field: "tag:tag-type" },
      { depth: 1, field: "tag:tag-planet" },
    ]);

    expect(keys["event-mars-conjunct-venus"]).toStrictEqual([
      ["tag-aspect"],
      ["tag-mars", "tag-venus"],
    ]);
  });

  it("leaves an event whose time cannot be read in no group", async () => {
    const unreadable = createTestEventsDatabase({
      extraSql: `
        insert into calendar_events (id, created_at, updated_at, description, "end", latitude, longitude, "start", "summary", timezone) values
          ('event-nowhere', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Nowhere', '2026-03-05T12:00:00.000Z', 0, 0, '2026-03-05T12:00:00.000Z', 'Nowhere', 'Not/AZone');
      `,
    });
    const events = await unreadable.findEvents({
      groups: compileEventGrouping([{ field: "day" }]),
      window: WHOLE_SEED,
    });

    expect(
      events.find(({ id }) => id === "event-nowhere")?.groups,
    ).toStrictEqual([[]]);
  });

  it("leaves every event in no group for a field it does not know", async () => {
    const keys = await findGroupKeys([{ field: "unknown-field" }]);

    expect(keys["event-mars-conjunct-venus"]).toStrictEqual([[]]);
  });

  it("makes a group of each tag picked, holding the events under it", async () => {
    const keys = await findGroupKeys([
      { field: "tag:tag-type", tags: ["tag-aspect", "tag-ingress"] },
    ]);

    expect(keys["event-mars-conjunct-venus"]).toStrictEqual([["tag-aspect"]]);
    expect(keys["event-sun-ingress-aries"]).toStrictEqual([["tag-ingress"]]);
    expect(keys["event-mercury-retrograde"]).toStrictEqual([[]]);
  });
});
