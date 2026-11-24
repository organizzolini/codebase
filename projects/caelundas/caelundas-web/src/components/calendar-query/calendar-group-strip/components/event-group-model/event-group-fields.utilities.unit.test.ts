import { beforeAll, describe, expect, it } from "vitest";

import { serveCalendarApi } from "../../../../../../testing/calendar-api";
import { findFacets } from "../../../../calendar-display/events-calendar/components/events-api/events-api.utilities";

import {
  createEventGroupFields,
  getDefaultGrouping,
  resolveEventGrouping,
  toGroupLevel,
} from "./event-group-fields.utilities";

let fields: ReturnType<typeof createEventGroupFields> = [];

/**
 * The field with an id, which the seeded facets are known to have.
 */
function fieldOf(id: string): (typeof fields)[number] {
  const field = fields.find((candidate) => candidate.id === id);

  if (field === undefined) {
    throw new Error(`No field ${id}`);
  }

  return field;
}

describe("event group fields", () => {
  beforeAll(async () => {
    serveCalendarApi();
    fields = createEventGroupFields(await findFacets());
  });

  describe(createEventGroupFields, () => {
    it("offers each tag root with the names at each depth, then the derived fields", () => {
      expect(fields.map(({ id }) => id)).toStrictEqual([
        "tag:tag-aspect",
        "tag:tag-body",
        "tag:tag-element",
        "tag:tag-planetary",
        "tag:tag-zodiac",
        "year",
        "quarter",
        "month",
        "week",
        "day",
        "weekday",
        "hour",
        "duration",
      ]);
      expect(
        fields.find(({ id }) => id === "tag:tag-aspect")?.levels,
      ).toStrictEqual([["Simple"], ["Major"], ["Conjunct", "Square"]]);
    });
  });

  describe("a tag's icon, note and parent", () => {
    const iconFields = createEventGroupFields([
      {
        id: "aspect",
        name: "Aspect",
        values: [
          {
            count: 2,
            depth: 1,
            icon: "orbit",
            id: "simple",
            name: "Simple",
            note: "Two bodies",
            path: "Simple",
          },
          {
            count: 1,
            depth: 2,
            id: "major",
            name: "Major",
            path: "Simple / Major",
          },
        ],
      },
    ]);

    it("carries a tag's icon and note, and the id of the tag above it", () => {
      const [simple] = iconFields[0]?.nodes ?? [];

      expect(simple?.icon).toBeDefined();
      expect(simple?.note).toBe("Two bodies");
      expect(simple?.parentId).toBeNull();
    });

    it("names the tag above a deeper tag", () => {
      const deeper = createEventGroupFields([
        {
          id: "aspect",
          name: "Aspect",
          values: [
            { count: 2, depth: 1, id: "a", name: "A", path: "A" },
            { count: 2, depth: 2, id: "b", name: "B", path: "A / B" },
            { count: 1, depth: 3, id: "c", name: "C", path: "A / B / C" },
          ],
        },
      ]);

      expect(
        deeper[0]?.nodes.map((node) => [node.id, node.parentId]),
      ).toStrictEqual([
        ["a", null],
        ["b", "a"],
      ]);
    });
  });

  describe(toGroupLevel, () => {
    it("starts a tag root at its first depth and a derived field plain", () => {
      expect(toGroupLevel({ ...fieldOf("tag:tag-aspect") })).toStrictEqual({
        depth: 1,
        field: "tag:tag-aspect",
      });
      expect(toGroupLevel({ ...fieldOf("month") })).toStrictEqual({
        field: "month",
      });
    });
  });

  describe(getDefaultGrouping, () => {
    it.each([
      { expected: [{ field: "tag:tag-aspect" }], view: "agenda" },
      { expected: [{ field: "tag:tag-body" }], view: "timeline" },
      { expected: [], view: "month" },
    ])(
      "groups the $view by default as the data allows",
      ({ expected, view }) => {
        expect(getDefaultGrouping(view, fields)).toStrictEqual(expected);
      },
    );
  });

  describe("nodes", () => {
    it("lists only the tags with tags beneath them, depth first", () => {
      const nodesOf = (id: string): string[] =>
        fields.find((field) => field.id === id)?.nodes.map((node) => node.id) ??
        [];

      expect(nodesOf("tag:tag-aspect")).toStrictEqual([
        "tag-simple",
        "tag-major",
      ]);
      expect(nodesOf("tag:tag-body")).toStrictEqual([]);
      expect(nodesOf("month")).toStrictEqual([]);
    });
  });

  describe(resolveEventGrouping, () => {
    it("drops fields the data lacks and repeats, with no cap on the levels", () => {
      expect(
        resolveEventGrouping(
          [
            { field: "tag:tag-moon" },
            { field: "month" },
            { field: "month" },
            { field: "tag:tag-body" },
            { field: "hour" },
            { field: "year" },
          ],
          fields,
        ),
      ).toStrictEqual([
        { field: "month" },
        { field: "tag:tag-body" },
        { field: "hour" },
        { field: "year" },
      ]);
    });

    it("keeps a parent only when it is a tag with tags beneath it", () => {
      expect(
        resolveEventGrouping(
          [{ field: "tag:tag-aspect", parent: "tag-conjunct" }],
          fields,
        ),
      ).toStrictEqual([]);
      expect(
        resolveEventGrouping(
          [{ field: "tag:tag-aspect", parent: "tag-major" }],
          fields,
        ),
      ).toStrictEqual([{ field: "tag:tag-aspect", parent: "tag-major" }]);
    });

    it("gives a derived field no parent", () => {
      expect(
        resolveEventGrouping([{ field: "day", parent: "tag-simple" }], fields),
      ).toStrictEqual([{ field: "day" }]);
    });

    it("lets a field repeat only straight after itself, one tag deeper", () => {
      expect(
        resolveEventGrouping(
          [
            { field: "tag:tag-aspect" },
            { field: "tag:tag-aspect", parent: "tag-simple" },
            { field: "tag:tag-aspect", parent: "tag-major" },
          ],
          fields,
        ),
      ).toHaveLength(3);
      expect(
        resolveEventGrouping(
          [
            { field: "tag:tag-aspect" },
            { field: "month" },
            { field: "tag:tag-aspect", parent: "tag-simple" },
          ],
          fields,
        ),
      ).toStrictEqual([{ field: "tag:tag-aspect" }, { field: "month" }]);
      expect(
        resolveEventGrouping(
          [
            { field: "tag:tag-aspect" },
            { field: "tag:tag-aspect", parent: "tag-major" },
          ],
          fields,
        ),
      ).toStrictEqual([{ field: "tag:tag-aspect" }]);
    });

    it("drops the same level twice", () => {
      expect(
        resolveEventGrouping(
          [
            { field: "tag:tag-aspect", parent: "tag-simple" },
            { field: "tag:tag-aspect", parent: "tag-simple" },
          ],
          fields,
        ),
      ).toStrictEqual([{ field: "tag:tag-aspect", parent: "tag-simple" }]);
    });
  });
});
