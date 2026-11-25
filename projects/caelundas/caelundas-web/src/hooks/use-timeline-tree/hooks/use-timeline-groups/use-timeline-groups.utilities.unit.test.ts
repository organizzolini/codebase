import { describe, expect, it } from "vitest";

import {
  getCollapsedIds,
  getToggledIds,
  listTimelineGroups,
} from "./use-timeline-groups.utilities";

import type { TimelineRows } from "../../../../components/calendar-display/calendar-timeline/calendar-timeline.types";

describe("use-timeline-groups utilities", () => {
  describe(getCollapsedIds, () => {
    it("lists the groups that are not open", () => {
      expect(getCollapsedIds(["a", "b", "c"], new Set(["b"]))).toStrictEqual([
        "a",
        "c",
      ]);
    });
  });

  describe(getToggledIds, () => {
    it("lists the ids that joined or left the closed ones", () => {
      expect(getToggledIds(["a", "b"], ["b", "c"])).toStrictEqual(["a", "c"]);
      expect(getToggledIds(["a"], ["a"])).toStrictEqual([]);
    });
  });

  describe(listTimelineGroups, () => {
    const rows: TimelineRows = {
      counts: new Map(),
      events: [],
      groups: new Map([
        ["/0:a", { fallback: false, key: "a", level: 0 }],
        ["/0:a/1:x", { fallback: false, key: "x", level: 1 }],
        ["/0:b", { fallback: false, key: "b", level: 0 }],
      ]),
      resources: [
        {
          children: [
            {
              children: [{ children: [], id: "/0:a/1:x:events", title: "" }],
              id: "/0:a/1:x",
              title: "x",
            },
          ],
          id: "/0:a",
          title: "a",
        },
        { children: [], id: "/0:b", title: "b" },
      ],
    };

    it("lists each group with its level, and the first path through them", () => {
      expect(listTimelineGroups(rows)).toStrictEqual({
        firstPath: ["/0:a", "/0:a/1:x"],
        groupIds: ["/0:a", "/0:a/1:x", "/0:b"],
        groupLevels: [0, 1, 0],
      });
    });

    it("lists nothing for a timeline with no groups", () => {
      expect(
        listTimelineGroups({
          counts: new Map(),
          events: [],
          groups: new Map(),
          resources: [{ id: "all", title: "All events" }],
        }),
      ).toStrictEqual({ firstPath: [], groupIds: [], groupLevels: [] });
    });
  });
});
