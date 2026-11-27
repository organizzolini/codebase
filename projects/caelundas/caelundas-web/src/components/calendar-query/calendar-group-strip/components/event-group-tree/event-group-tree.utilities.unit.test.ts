import { beforeAll, describe, expect, it } from "vitest";

import { serveCalendarApi } from "../../../../../../testing/calendar-api";
import {
  findEvents,
  findFacets,
} from "../../../../calendar-display/events-calendar/components/events-api/events-api.utilities";
import {
  createEventGroupFields,
  getDefaultGrouping,
} from "../event-group-model/event-group-fields.utilities";
import { formatDerivedKey } from "../event-group-model/event-group-labels.utilities";

import { createTagRanks } from "./event-group-sort.utilities";
import {
  buildEventGroups,
  sortEventGroups,
} from "./event-group-tree.utilities";

import type { EventFacet } from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  EventGrouping,
  EventGroupNode,
} from "../event-group-model/event-groups.types";

const WINDOW = {
  end: new Date("2027-01-01T00:00:00.000Z"),
  start: new Date("2026-01-01T00:00:00.000Z"),
};
let fields: ReturnType<typeof createEventGroupFields> = [];

/**
 * The seeded events grouped by a grouping, as the page would group them.
 */
async function group(grouping: EventGrouping): Promise<EventGroupNode[]> {
  serveCalendarApi();

  const events = await findEvents({
    grouping: {
      levels: grouping.map((level) => ({
        ...level,
        tags: [...(level.tags ?? [])],
      })),
    },
    period: WINDOW,
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
  beforeAll(async () => {
    serveCalendarApi();
    fields = createEventGroupFields(await findFacets());
  });

  describe(buildEventGroups, () => {
    it("nests the default grouping as the tag tree: roots, then each tag level beneath, skipping none", async () => {
      const tree = await group(getDefaultGrouping(fields));

      expect(summarize(tree)).toStrictEqual([
        ["Aspect 2", [["Simple 2", [["Major 2", ["Conjunct 1", "Square 1"]]]]]],
        ["Body 6", ["Mars 2", "Mercury 1", "Saturn 1", "Sun 2", "Venus 2"]],
        ["Element 2", ["Fire 2"]],
        ["Planetary 1", [["Direction 1", ["Retrograde Period 1"]]]],
        ["Sign 3", ["Aries 2", "Ingress 3"]],
      ]);
    });

    it("counts an event under two planets in each, and once above them", async () => {
      const tree = await group([
        { field: "tag:tag-aspect" },
        { field: "tag:tag-body" },
      ]);

      expect(summarize(tree)).toStrictEqual([
        ["Simple 2", ["Mars 2", "Saturn 1", "Venus 1"]],
        ["No Aspect 4", ["Mercury 1", "Sun 2", "Venus 1"]],
      ]);
    });

    it("splits a second level of a root only by the tags beneath each parent", async () => {
      const tree = await group([
        { field: "tag:tag-aspect" },
        { field: "tag:tag-aspect", parent: "tag-simple" },
      ]);

      expect(summarize(tree)).toStrictEqual([
        ["Simple 2", ["Major 2"]],
        "No Aspect 4",
      ]);
    });

    it("keeps refining one parent's group a level deeper, leaving the others whole", async () => {
      const tree = await group([
        { field: "tag:tag-aspect" },
        { field: "tag:tag-aspect", parent: "tag-simple" },
        { field: "tag:tag-aspect", parent: "tag-major" },
      ]);

      expect(summarize(tree)).toStrictEqual([
        ["Simple 2", [["Major 2", ["Conjunct 1", "Square 1"]]]],
        "No Aspect 4",
      ]);
    });

    it('adds no "No" group beside a refinement, though it does for a level of its own', async () => {
      const refined = await group([
        { field: "tag:tag-aspect" },
        { field: "tag:tag-aspect", parent: "tag-simple" },
      ]);
      const alone = await group([
        { field: "tag:tag-aspect", parent: "tag-simple" },
      ]);

      expect(refined.map((node) => node.label)).not.toContain("No Simple");
      expect(refined[0]?.children.map((node) => node.label)).toStrictEqual([
        "Major",
      ]);
      expect(alone.map((node) => node.label)).toStrictEqual([
        "Major",
        "No Simple",
      ]);
    });

    it("gathers events with no tag in a dimension into a last group", async () => {
      const tree = await group([{ field: "tag:tag-zodiac" }]);

      expect(summarize(tree)).toStrictEqual([
        "Aries 2",
        "Ingress 3",
        "No Sign 3",
      ]);
    });

    it("names each group by its path and a unique id", async () => {
      const [aspect] = await group([
        { field: "tag:tag-aspect", parent: "tag-major" },
      ]);

      expect(aspect?.path).toStrictEqual(["Conjunct"]);
      expect(aspect?.id).toBe("/0:tag-conjunct");
    });

    it("puts events read without keys in a field's last group", async () => {
      serveCalendarApi();

      const events = await findEvents({ period: WINDOW });

      expect(
        summarize(
          buildEventGroups(events, [{ field: "unknown-field" }], fields),
        ),
      ).toStrictEqual(["No unknown-field 6"]);
    });

    it("counts an event once in a group it is keyed to twice", async () => {
      serveCalendarApi();

      const [first] = await findEvents({ period: WINDOW });
      const twice = { key: "tag-x", label: null, path: "Type / X" };

      expect(
        first === undefined
          ? []
          : summarize(
              buildEventGroups(
                [{ ...first, groups: [[twice, twice]] }],
                [{ field: "tag:tag-aspect" }],
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
      { expected: "9", field: "weekday", key: "9" },
      { expected: "other", field: "other", key: "other" },
    ])(
      "writes the $field key $key as $expected",
      ({ expected, field, key }) => {
        expect(formatDerivedKey(field, key)).toBe(expected);
      },
    );
  });

  describe(sortEventGroups, () => {
    function node(
      label: string,
      count: number,
      first: string,
      children: EventGroupNode[] = [],
    ): EventGroupNode {
      return {
        children,
        count,
        events: [
          { start: new Date(first) } as EventGroupNode["events"][number],
        ],
        id: label,
        key: label,
        label,
        level: 0,
        path: [label],
      };
    }

    const labels = (nodes: EventGroupNode[]): string[] =>
      nodes.map((current) => current.label);
    const nodes = (): EventGroupNode[] => [
      node("Mars", 5, "2026-03-01"),
      node("Venus", 9, "2026-01-01"),
      node("Moon", 2, "2026-02-01"),
    ];

    it("orders the events inside each group that lists them, and the groups by the same sort", () => {
      const event = (
        name: string,
        start: string,
        minutes: number,
      ): EventGroupNode["events"][number] =>
        ({
          durationMinutes: minutes,
          end: new Date(new Date(start).getTime() + minutes * 60_000),
          name,
          start: new Date(start),
          tags: [],
        }) as unknown as EventGroupNode["events"][number];
      const long = event("long", "2026-03-01T10:00:00.000Z", 300);
      const short = event("short", "2026-03-02T10:00:00.000Z", 30);
      const parent = {
        ...node("Parent", 2, "2026-03-01"),
        children: [{ ...node("Leaf", 2, "2026-03-01"), events: [long, short] }],
        events: [long, short],
      };
      const [sorted] = sortEventGroups(
        [parent],
        [{ direction: "asc", key: "duration" }],
      );

      expect(sorted?.children[0]?.events.map((one) => one.name)).toStrictEqual([
        "short",
        "long",
      ]);
      // Only the groups with no subgroup list events, so a parent keeps its own order.
      expect(sorted?.events.map((one) => one.name)).toStrictEqual([
        "long",
        "short",
      ]);
    });

    it("leaves the groups as built when there is no sort", () => {
      expect(labels(sortEventGroups(nodes(), undefined))).toStrictEqual([
        "Mars",
        "Venus",
        "Moon",
      ]);
    });

    it.each([
      [{ direction: "asc", key: "name" }, ["Mars", "Moon", "Venus"]],
      [{ direction: "desc", key: "name" }, ["Venus", "Moon", "Mars"]],
      [{ direction: "desc", key: "count" }, ["Venus", "Mars", "Moon"]],
      [{ direction: "asc", key: "first" }, ["Venus", "Moon", "Mars"]],
    ] as const)("orders by %j", (sort, expected) => {
      expect(labels(sortEventGroups(nodes(), [sort]))).toStrictEqual(expected);
    });

    it("orders by the tag rank a group carries, or its name without one", () => {
      const ordered = [
        { ...node("Late", 1, "2026-01-01"), rank: "b" },
        { ...node("Early", 1, "2026-01-01"), rank: "a" },
        node("Zed", 1, "2026-01-01"),
      ];

      expect(
        labels(sortEventGroups(ordered, [{ direction: "asc", key: "order" }])),
      ).toStrictEqual(["Early", "Late", "Zed"]);
    });

    it("puts a group with no events first when ordering by first event", () => {
      const empty = { ...node("Empty", 0, "2026-01-01"), events: [] };

      expect(
        labels(
          sortEventGroups(
            [node("Mars", 5, "2026-03-01"), empty],
            [{ direction: "asc", key: "first" }],
          ),
        ),
      ).toStrictEqual(["Empty", "Mars"]);
    });

    it("breaks the ties of one sort with the next", () => {
      const tied = [
        node("Mars", 5, "2026-03-01"),
        node("Moon", 5, "2026-02-01"),
        node("Venus", 9, "2026-01-01"),
      ];

      expect(
        labels(
          sortEventGroups(tied, [
            { direction: "asc", key: "count" },
            { direction: "desc", key: "name" },
          ]),
        ),
      ).toStrictEqual(["Moon", "Mars", "Venus"]);
    });

    it("leaves the groups as built for a metric, which only the metric layouts measure", () => {
      expect(
        labels(
          sortEventGroups(nodes(), [
            { direction: "desc", key: "metric", metric: "events" },
          ]),
        ),
      ).toStrictEqual(["Mars", "Venus", "Moon"]);
    });

    it("leaves the groups as built for an empty list of sorts", () => {
      expect(labels(sortEventGroups(nodes(), []))).toStrictEqual([
        "Mars",
        "Venus",
        "Moon",
      ]);
    });

    it("orders the groups under each group too", () => {
      const [parent] = sortEventGroups(
        [
          node("Aspect", 3, "2026-01-01", [
            node("Z", 1, "2026-01-01"),
            node("A", 2, "2026-01-02"),
          ]),
        ],
        [{ direction: "asc", key: "name" }],
      );

      expect(labels(parent?.children ?? [])).toStrictEqual(["A", "Z"]);
    });
  });

  describe(createTagRanks, () => {
    const facets: EventFacet[] = [
      {
        id: "aspect",
        name: "Aspect",
        values: [
          { count: 2, depth: 1, id: "simple", name: "Simple", path: "Simple" },
          {
            count: 1,
            depth: 2,
            id: "major",
            name: "Major",
            path: "Simple / Major",
          },
        ],
      },
      {
        id: "body",
        name: "Body",
        values: [{ count: 1, depth: 1, id: "sun", name: "Sun", path: "Sun" }],
      },
    ];

    it("ranks every tag by its place in tree order across the roots", () => {
      const { ranks } = createTagRanks(facets);

      expect([...ranks.entries()]).toStrictEqual([
        ["simple", 0],
        ["major", 1],
        ["sun", 2],
      ]);
    });

    it("gives each root's field and each tag the path its children sit beneath", () => {
      const { prefixes } = createTagRanks(facets);

      expect(prefixes.get("tag:aspect")).toBe("Aspect / ");
      expect(prefixes.get("simple")).toBe("Aspect / Simple / ");
      expect(prefixes.get("sun")).toBe("Body / Sun / ");
    });
  });

  describe("sorting by a tag", () => {
    const { prefixes, ranks } = createTagRanks([
      {
        id: "body",
        name: "Body",
        values: [
          { count: 1, depth: 1, id: "sun", name: "Sun", path: "Sun" },
          { count: 1, depth: 1, id: "moon", name: "Moon", path: "Moon" },
          { count: 1, depth: 1, id: "mars", name: "Mars", path: "Mars" },
        ],
      },
    ]);
    const tagRanks = { prefixes, ranks };

    function holding(
      label: string,
      tags: { id: string; path: string }[],
    ): EventGroupNode {
      return {
        children: [],
        count: 1,
        events: [
          {
            start: new Date("2026-01-01"),
            tags: tags.map(({ id, path }) => ({
              depth: 1,
              id,
              name: id,
              path,
            })),
          } as unknown as EventGroupNode["events"][number],
        ],
        id: label,
        key: label,
        label,
        level: 0,
        path: [label],
      };
    }

    function tagged(label: string, ...tagIds: string[]): EventGroupNode {
      return holding(
        label,
        tagIds.map((id) => ({
          id,
          path: `Body / ${id[0]?.toUpperCase() ?? ""}${id.slice(1)}`,
        })),
      );
    }

    const groups = (): EventGroupNode[] => [
      tagged("Late", "mars"),
      tagged("Both", "moon", "mars"),
      tagged("None"),
      tagged("Early", "sun"),
    ];
    const names = (nodes: EventGroupNode[]): string[] =>
      nodes.map((current) => current.label);

    it("ranks a group by the lowest place of its events' tags, groups with none last", () => {
      expect(
        names(
          sortEventGroups(
            groups(),
            [{ direction: "asc", key: "tag", tag: "tag:body" }],
            tagRanks,
          ),
        ),
      ).toStrictEqual(["Early", "Both", "Late", "None"]);
    });

    it("reverses the ranking when descending", () => {
      expect(
        names(
          sortEventGroups(
            groups(),
            [{ direction: "desc", key: "tag", tag: "tag:body" }],
            tagRanks,
          ),
        ),
      ).toStrictEqual(["None", "Late", "Both", "Early"]);
    });

    it("ignores tags beneath another root, or with no place in the ranks", () => {
      const other = holding("Other", [{ id: "mars", path: "Sign / Mars" }]);
      const absent = holding("Absent", [{ id: "ghost", path: "Body / Ghost" }]);

      expect(
        names(
          sortEventGroups(
            [other, absent, tagged("Ranked", "moon")],
            [{ direction: "asc", key: "tag", tag: "tag:body" }],
            tagRanks,
          ),
        ),
      ).toStrictEqual(["Ranked", "Other", "Absent"]);
    });

    it("ranks nothing for a tag sort that names no tag", () => {
      expect(
        names(
          sortEventGroups(
            groups(),
            [{ direction: "asc", key: "tag" }],
            tagRanks,
          ),
        ),
      ).toStrictEqual(["Late", "Both", "None", "Early"]);
    });

    it("leaves every group tied without ranks", () => {
      expect(
        names(
          sortEventGroups(groups(), [
            { direction: "asc", key: "tag", tag: "tag:body" },
          ]),
        ),
      ).toStrictEqual(["Late", "Both", "None", "Early"]);
    });
  });
});
