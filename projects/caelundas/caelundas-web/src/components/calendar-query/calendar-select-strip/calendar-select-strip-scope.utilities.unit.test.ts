import { describe, expect, it } from "vitest";

import { createEventFilterFields } from "../calendar-filters/components/event-filter-model/event-filter-fields.utilities";
import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  dropHiddenSorts,
  getSelectedColumnIds,
  isTagSelected,
  restrictFilterFields,
  restrictGroupFields,
  restrictSortKeys,
} from "./calendar-select-strip-scope.utilities";

const FACETS = [
  {
    id: "body",
    name: "Body",
    values: [
      { count: 2, depth: 1, id: "planet", name: "Planet", path: "Planet" },
      {
        count: 1,
        depth: 2,
        id: "venus",
        name: "Venus",
        path: "Planet / Venus",
      },
    ],
  },
  {
    id: "zodiac",
    name: "Zodiac",
    values: [
      { count: 2, depth: 1, id: "sign", name: "Sign", path: "Sign" },
      { count: 1, depth: 2, id: "aries", name: "Aries", path: "Sign / Aries" },
    ],
  },
];

describe("column scope utilities", () => {
  describe(dropHiddenSorts, () => {
    const fields = createEventGroupFields(FACETS);
    const NAME = { direction: "asc", key: "name" } as const;
    const DURATION = { direction: "desc", key: "duration" } as const;
    const FIRST = { direction: "asc", key: "first" } as const;
    const ORDER = { direction: "asc", key: "order" } as const;
    const COUNT = { direction: "desc", key: "count" } as const;
    const METRIC = {
      direction: "desc",
      key: "metric",
      metric: "progressive-events",
    } as const;

    it("takes the sorts of an unselected column away, whichever it is", () => {
      const sorts = [
        NAME,
        DURATION,
        { direction: "asc", key: "start" } as const,
      ];

      expect(dropHiddenSorts(sorts, ["name"], fields)).toStrictEqual([NAME]);
      expect(dropHiddenSorts(sorts, ["duration"], fields)).toStrictEqual([
        DURATION,
      ]);
      expect(dropHiddenSorts([FIRST], ["start"], fields)).toStrictEqual([
        FIRST,
      ]);
      expect(dropHiddenSorts([FIRST], ["name"], fields)).toBeUndefined();
    });

    it("keeps Tags, Event count and metrics, which depend on no column", () => {
      const sorts = [ORDER, COUNT, METRIC];

      expect(dropHiddenSorts(sorts, ["name"], fields)).toBe(sorts);
    });

    it("takes a tag sort away with its root's column, and keeps it with the root or the tag", () => {
      const root = { direction: "asc", key: "tag", tag: "tag:body" } as const;
      const tag = { direction: "asc", key: "tag", tag: "planet" } as const;

      expect(dropHiddenSorts([root, tag], ["name"], fields)).toBeUndefined();
      expect(dropHiddenSorts([root, tag], ["tag:body"], fields)).toStrictEqual([
        root,
        tag,
      ]);
      expect(dropHiddenSorts([root, tag], ["planet"], fields)).toStrictEqual([
        root,
        tag,
      ]);
      expect(
        dropHiddenSorts([root, tag], ["tag:zodiac"], fields),
      ).toBeUndefined();
    });

    it("is none for the default sort and when every sort goes", () => {
      expect(dropHiddenSorts(undefined, ["name"], fields)).toBeUndefined();
      expect(dropHiddenSorts([DURATION], ["name"], fields)).toBeUndefined();
    });

    it("hands back the sorts themselves when none goes", () => {
      const sorts = [NAME, ORDER];

      expect(dropHiddenSorts(sorts, ["name", "start"], fields)).toBe(sorts);
    });
  });

  describe(getSelectedColumnIds, () => {
    it("is the columns the link names, else the defaults", () => {
      expect(getSelectedColumnIds(["end"])).toStrictEqual(["end"]);
      expect(getSelectedColumnIds(undefined)).toStrictEqual([
        "name",
        "start",
        "end",
      ]);
      expect(getSelectedColumnIds([])).toStrictEqual(["name", "start", "end"]);
    });
  });

  describe(isTagSelected, () => {
    it("is true for a selected root, or a selected tag beneath it", () => {
      expect(isTagSelected("tag:body", ["venus"], ["tag:body"])).toBe(true);
      expect(isTagSelected("tag:body", ["venus"], ["venus"])).toBe(true);
      expect(isTagSelected("tag:body", ["venus"], ["name"])).toBe(false);
    });
  });

  describe(restrictGroupFields, () => {
    const fields = createEventGroupFields(FACETS);

    it("keeps a root whose own column is selected, whole", () => {
      const kept = restrictGroupFields(fields, ["tag:body"]).filter(
        (field) => field.id === "tag:body",
      );

      expect(kept).toHaveLength(1);
      expect(kept[0]?.nodes.map((node) => node.id)).toStrictEqual(["planet"]);
    });

    it("keeps only the selected tags of a root with no column of its own", () => {
      const kept = restrictGroupFields(fields, ["planet"]);

      expect(kept.map((field) => field.id)).toStrictEqual(["tag:body"]);
      expect(kept[0]?.nodes.map((node) => node.id)).toStrictEqual(["planet"]);
    });

    it("keeps nothing when no tag column is selected", () => {
      expect(
        restrictGroupFields(fields, ["name", "start", "end"]),
      ).toStrictEqual([]);
    });
  });

  describe(restrictFilterFields, () => {
    const fields = createEventFilterFields(FACETS);
    const ids = (selected: readonly string[]): string[] =>
      restrictFilterFields(fields, selected).map((field) => field.id);

    it("offers a tag root for its own column or a tag beneath it", () => {
      expect(ids(["tag:body"])).toStrictEqual(["tag:body"]);
      expect(ids(["aries"])).toStrictEqual(["tag:zodiac"]);
    });

    it("offers the date, weekday and hour fields for Start or End, and text for Name", () => {
      expect(ids(["start"])).toStrictEqual(["date", "weekday", "hour"]);
      expect(ids(["name"])).toStrictEqual(["text"]);
    });

    it("offers the duration fields only when both Start and End are selected", () => {
      expect(ids(["start", "end"])).toContain("duration");
      expect(ids(["start"])).not.toContain("duration");
    });
  });

  describe(restrictSortKeys, () => {
    it("always offers Tags and Event count", () => {
      expect(restrictSortKeys([])).toStrictEqual(["order", "count"]);
    });

    it("adds each of Name, Start, End and Duration with its column, and First event with Start or End", () => {
      expect(restrictSortKeys(["name", "end"])).toStrictEqual([
        "order",
        "name",
        "count",
        "first",
        "end",
      ]);
      expect(restrictSortKeys(["duration", "start"])).toStrictEqual([
        "order",
        "count",
        "first",
        "start",
        "duration",
      ]);
    });
  });
});
