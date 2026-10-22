import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

import { compileEventGrouping } from "./event-group-compiler";
import { createEventGroupFields } from "./event-group-fields";
import { formatDerivedKey } from "./event-group-labels";
import { buildEventGroups } from "./event-group-tree";

import type { EventGrouping, EventGroupNode } from "./event-groups.types";

const database = createTestEventsDatabase();
const fields = createEventGroupFields(await database.findFacets());

/**
 * The seeded events grouped by a grouping, as the page would group them.
 */
async function group(grouping: EventGrouping): Promise<EventGroupNode[]> {
  const events = await database.findEvents({
    groups: compileEventGrouping(grouping),
    window: {
      end: new Date("2027-01-01T00:00:00.000Z"),
      start: new Date("2026-01-01T00:00:00.000Z"),
    },
  });

  return buildEventGroups(events, grouping, fields);
}

/**
 * A tree's labels and counts, nested.
 */
function summarize(nodes: readonly EventGroupNode[]): unknown[] {
  return nodes.map((node) =>
    node.children.length === 0
      ? `${node.label} ${String(node.count)}`
      : [`${node.label} ${String(node.count)}`, summarize(node.children)],
  );
}

describe("event group tree", () => {
  describe(buildEventGroups, () => {
    it("counts an event under two planets in each, and once above them", async () => {
      const tree = await group([
        { depth: 1, field: "tag:tag-type" },
        { depth: 1, field: "tag:tag-planet" },
      ]);

      expect(summarize(tree)).toStrictEqual([
        ["Aspect 2", ["Mars 2", "Saturn 1", "Venus 1"]],
        ["Ingress 3", ["Sun 2", "Venus 1"]],
        ["Retrograde 1", ["Mercury 1"]],
      ]);
    });

    it("gathers events with no tag in a dimension into a last group", async () => {
      const tree = await group([{ depth: 1, field: "tag:tag-sign" }]);

      expect(summarize(tree)).toStrictEqual(["Aries 2", "No Sign 4"]);
    });

    it("names each group by its path and a unique id", async () => {
      const [aspect] = await group([{ depth: 3, field: "tag:tag-type" }]);

      expect(aspect?.path).toStrictEqual([
        "Aspect",
        "Major Aspect",
        "Conjunct",
      ]);
      expect(aspect?.id).toBe("/0:tag-conjunct");
    });

    it("orders derived groups in time", async () => {
      const tree = await group([{ field: "duration" }]);

      expect(summarize(tree)).toStrictEqual(["Instant 5", "Weeks 1"]);
    });

    it("puts events read without keys in a field's last group", async () => {
      const events = await database.findEvents({
        window: {
          end: new Date("2027-01-01T00:00:00.000Z"),
          start: new Date("2026-01-01T00:00:00.000Z"),
        },
      });

      expect(
        summarize(
          buildEventGroups(events, [{ field: "unknown-field" }], fields),
        ),
      ).toStrictEqual(["No unknown-field 6"]);
    });

    it("counts an event once in a group it is keyed to twice", async () => {
      const [first] = await database.findEvents({
        window: {
          end: new Date("2027-01-01T00:00:00.000Z"),
          start: new Date("2026-01-01T00:00:00.000Z"),
        },
      });
      const twice = { key: "tag-x", label: null, path: "Type / X" };

      expect(
        first === undefined
          ? []
          : summarize(
              buildEventGroups(
                [{ ...first, groups: [[twice, twice]] }],
                [{ depth: 1, field: "tag:tag-type" }],
                fields,
              ),
            ),
      ).toStrictEqual(["tag-x 1"]);
    });
  });

  describe(formatDerivedKey, () => {
    it.each([
      { expected: "2026", field: "year", key: "2026" },
      { expected: "Q1 2026", field: "quarter", key: "2026-Q1" },
      { expected: "March 2026", field: "month", key: "2026-03" },
      { expected: "Week of March 22, 2026", field: "week", key: "2026-03-22" },
      {
        expected: "Wednesday, March 25, 2026",
        field: "day",
        key: "2026-03-25",
      },
      { expected: "Wednesday", field: "weekday", key: "3" },
      { expected: "12 AM", field: "hour", key: "00" },
      { expected: "11 PM", field: "hour", key: "23" },
      { expected: "Hours", field: "duration", key: "hours" },
      { expected: "eons", field: "duration", key: "eons" },
      { expected: "9", field: "weekday", key: "9" },
      { expected: "other", field: "other", key: "other" },
    ])(
      "writes the $field key $key as $expected",
      ({ expected, field, key }) => {
        expect(formatDerivedKey(field, key)).toBe(expected);
      },
    );
  });
});
