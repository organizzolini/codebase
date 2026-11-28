import { describe, expect, it } from "vitest";

import { EMPTY_EVENT_FILTER } from "../calendar-filters/components/event-filter-model/event-filter-tree.constants";

import { VIEWS } from "./calendar-view-strip.constants";
import {
  findActiveViewId,
  getViewSelection,
  listViewChoices,
  resolveViews,
} from "./calendar-view-strip.utilities";

const FACETS = [
  {
    id: "aspect",
    name: "Aspect",
    values: [
      { count: 9, depth: 1, id: "simple", name: "Simple", path: "Simple" },
      {
        count: 4,
        depth: 2,
        id: "major",
        name: "Major",
        path: "Simple / Major",
      },
    ],
  },
  {
    id: "lunar",
    name: "Lunar",
    values: [
      {
        count: 4,
        depth: 1,
        id: "monthly",
        name: "Monthly Cycle",
        path: "Monthly Cycle",
      },
    ],
  },
];

describe("calendar-view-strip utilities", () => {
  describe(resolveViews, () => {
    const views = resolveViews(FACETS);

    it("keeps the views whose tags the data has, then All Events", () => {
      expect(views.map((view) => view.id)).toStrictEqual([
        "major-aspects",
        "lunar-phases",
        "all-events",
      ]);
    });

    it("filters to the tag, groups by its children and sorts by its order", () => {
      expect(views[0]).toMatchObject({
        filter: {
          rules: [
            { operator: "is_any_of", path: ["tag:aspect"], value: ["major"] },
          ],
        },
        group: [{ field: "tag:aspect", parent: "major" }],
        sort: [{ direction: "asc", key: "tag", tag: "major" }],
      });
    });

    it("leaves All Events with no filter, grouping or sort", () => {
      expect(views.at(-1)).toMatchObject({
        filter: EMPTY_EVENT_FILTER,
        group: undefined,
        sort: undefined,
      });
    });

    it("offers only All Events when the data has no tags", () => {
      expect(resolveViews([]).map((view) => view.id)).toStrictEqual([
        "all-events",
      ]);
    });

    it("leaves out a view whose roots the data has but whose tags it lacks", () => {
      const roots = [
        "Aspect",
        "Body",
        "Daily",
        "Eclipse",
        "Lunar",
        "Planetary",
        "Retrograde",
        "Sign",
      ];
      const resolved = resolveViews(
        roots.map((name) => ({
          id: name.toLowerCase(),
          name,
          values: [{ count: 1, depth: 1, id: "odd", name: "Odd", path: "Odd" }],
        })),
      );

      expect(resolved.map((view) => view.id)).toStrictEqual(["all-events"]);
    });

    it("groups and sorts by a root's own tags when the view names no path", () => {
      const resolved = resolveViews([
        {
          id: "zodiac",
          name: "Sign",
          values: [
            {
              count: 1,
              depth: 1,
              id: "zodiac-group",
              name: "Zodiac",
              path: "Zodiac",
            },
            {
              count: 1,
              depth: 2,
              id: "aries",
              name: "Aries",
              path: "Zodiac / Aries",
            },
            { count: 1, depth: 1, id: "fire", name: "Fire", path: "Fire" },
          ],
        },
        {
          id: "ingress",
          name: "Ingress",
          values: [
            { count: 1, depth: 1, id: "stay", name: "Stay", path: "Stay" },
            {
              count: 1,
              depth: 2,
              id: "whole",
              name: "Full Sign",
              path: "Stay / Full Sign",
            },
          ],
        },
        {
          id: "body",
          name: "Body",
          values: [{ count: 1, depth: 1, id: "sun", name: "Sun", path: "Sun" }],
        },
      ]);
      const [signs] = resolved;

      expect(signs?.id).toBe("body-signs");
      expect(signs?.filter).toMatchObject({
        rules: [{ path: ["tag:ingress"], value: ["whole"] }],
      });
      expect(signs?.group).toStrictEqual([
        { field: "tag:zodiac", tags: ["aries"] },
        { field: "tag:body" },
      ]);
    });

    it("gives every definition an icon, a description and a name", () => {
      for (const definition of VIEWS) {
        expect(definition.icon).not.toBe("");
        expect(definition.description).not.toBe("");
        expect(definition.name).not.toBe("");
      }
    });
  });

  describe(listViewChoices, () => {
    it("lists each view with its icon", () => {
      expect(listViewChoices(resolveViews(FACETS))).toMatchObject([
        { icon: "triangle", id: "major-aspects", label: "Major Aspects" },
        { icon: "moon", id: "lunar-phases", label: "Lunar Phases" },
        { icon: "layers", id: "all-events", label: "All Events" },
      ]);
    });
  });

  describe(findActiveViewId, () => {
    const views = resolveViews(FACETS);
    const [major] = views;

    it("names the view the filter, group and sort all match", () => {
      expect(
        findActiveViewId(views, {
          filter: major?.filter ?? EMPTY_EVENT_FILTER,
          group: major?.group,
          sort: major?.sort,
        }),
      ).toBe("major-aspects");
    });

    it("names All Events for no filter, grouping or sort", () => {
      expect(
        findActiveViewId(views, {
          filter: EMPTY_EVENT_FILTER,
          group: undefined,
          sort: undefined,
        }),
      ).toBe("all-events");
    });

    it("names Custom once the group or sort drifts from the view", () => {
      expect(
        findActiveViewId(views, {
          filter: major?.filter ?? EMPTY_EVENT_FILTER,
          group: undefined,
          sort: major?.sort,
        }),
      ).toBe("custom");
      expect(
        findActiveViewId(views, {
          filter: major?.filter ?? EMPTY_EVENT_FILTER,
          group: major?.group,
          sort: [{ direction: "desc", key: "tag", tag: "major" }],
        }),
      ).toBe("custom");
    });
  });

  describe(getViewSelection, () => {
    const views = resolveViews(FACETS);

    it("gives the three parts a view writes, and nothing for a view the data lacks", () => {
      expect(getViewSelection(views, "lunar-phases")).toMatchObject({
        group: [{ field: "tag:lunar", parent: "monthly" }],
      });
      expect(getViewSelection(views, "retired")).toBeUndefined();
      expect(getViewSelection(views, undefined)).toBeUndefined();
    });
  });
});
