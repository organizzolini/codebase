import { describe, expect, it } from "vitest";

import { createRecord } from "../../../../../../testing/calendar/calendar-records";

import {
  createGroupOf,
  getDefaultRoots,
  groupCalendarEvents,
  isDefaultGrouping,
} from "./calendar-groups.utilities";

import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

const DEFAULT_GROUPING = [{ field: "tag:*", tags: ["a"] }];
const DAY = "2026-03-03T10:00:00Z";
// The roots a facet flags as grouping by default; Body, Duration and Temporality are not among them.
const ROOTS = new Set(["Aspect", "Lunar", "Sign"]);

describe("the calendar's groups", () => {
  describe(getDefaultRoots, () => {
    it("names the roots the data does not flag out of default grouping", () => {
      expect(
        getDefaultRoots([
          { id: "1", name: "Aspect", values: [] },
          { id: "2", isDefaultGroup: false, name: "Body", values: [] },
          { id: "3", isDefaultGroup: true, name: "Sign", values: [] },
        ]),
      ).toStrictEqual(new Set(["Aspect", "Sign"]));
    });
  });

  describe(isDefaultGrouping, () => {
    it("is the first level over every tag root", () => {
      expect(isDefaultGrouping(DEFAULT_GROUPING)).toBe(true);
      expect(isDefaultGrouping([{ depth: 1, field: "tag:*" }])).toBe(false);
      expect(isDefaultGrouping([{ field: "tag:body" }])).toBe(false);
      expect(isDefaultGrouping([])).toBe(false);
    });
  });

  describe(createGroupOf, () => {
    it("falls an event under its first root the data flags as grouping by default", () => {
      const groupOf = createGroupOf(DEFAULT_GROUPING, ROOTS);

      expect(
        groupOf(createRecord("a", DAY, DAY, ["Body", "Duration", "Sign"])),
      ).toStrictEqual({ id: "id-Sign", key: "id-Sign", label: "Sign" });
    });

    it("falls back to the first root when an event has only attributes", () => {
      expect(
        createGroupOf(
          DEFAULT_GROUPING,
          ROOTS,
        )(createRecord("a", DAY, DAY, ["Body", "Temporality"])).label,
      ).toBe("Body");
    });

    it("takes the first key of the first level of a grouping the user picked", () => {
      expect(
        createGroupOf([{ field: "tag:body" }])(
          createRecord("a", DAY, DAY, ["Body", "Sign"]),
        ).label,
      ).toBe("Body");
    });

    it("names the group of events with none", () => {
      expect(
        createGroupOf(DEFAULT_GROUPING)({
          ...createRecord("a", DAY),
          groups: [],
        }),
      ).toStrictEqual({ id: "none", key: null, label: "Other" });
    });

    it("reads a root from a key's label when it has no path", () => {
      const record = createRecord("a", DAY);

      expect(
        createGroupOf(
          DEFAULT_GROUPING,
          ROOTS,
        )({
          ...record,
          groups: [
            [
              { key: "k", label: "Body", path: null },
              { key: "j", label: "Sign", path: null },
            ],
          ],
        }).id,
      ).toBe("j");
    });
  });

  describe(groupCalendarEvents, () => {
    it("splits events into groups in the order of their tags, each event once", () => {
      const groups = groupCalendarEvents(
        [
          createRecord("a", DAY, DAY, ["Sign"]),
          createRecord("b", DAY, DAY, ["Aspect"]),
          createRecord("c", DAY, DAY, ["Body", "Aspect"]),
        ],
        { grouping: DEFAULT_GROUPING, roots: ROOTS },
      );

      expect(groups.map((group) => group.label)).toStrictEqual([
        "Aspect",
        "Sign",
      ]);
      expect(groups.map((group) => group.events.length)).toStrictEqual([2, 1]);
    });

    it("puts the events with no group last", () => {
      const groups = groupCalendarEvents(
        [
          { ...createRecord("a", DAY), groups: [] },
          createRecord("b", DAY, DAY, ["Sign"]),
          { ...createRecord("c", DAY), groups: [] },
        ],
        { grouping: DEFAULT_GROUPING, roots: ROOTS },
      );

      expect(groups.map((group) => group.id)).toStrictEqual([
        "id-Sign",
        "none",
      ]);
      expect(groups[1]?.events).toHaveLength(2);
    });

    it("colors a group by its tag's color, else by the color most of its events share", () => {
      const red = { ...createRecord("a", DAY, DAY, ["Sign"]), color: "red" };
      const blue = {
        ...createRecord("b", DAY, DAY, ["Aspect"]),
        color: "blue",
      };
      const blue2 = {
        ...createRecord("c", DAY, DAY, ["Aspect"]),
        color: "blue",
      };
      const plain = createRecord("d", DAY, DAY, ["Lunar"]);
      const groups = groupCalendarEvents([red, blue, blue2, plain], {
        colors: new Map([["id-Sign", "green"]]),
        grouping: DEFAULT_GROUPING,
      });

      expect(
        Object.fromEntries(groups.map((group) => [group.label, group.color])),
      ).toStrictEqual({
        Aspect: "blue",
        Lunar: undefined,
        Sign: "green",
      });
    });

    it("leaves none of its groups colored without colors", () => {
      expect(
        groupCalendarEvents([{ ...createRecord("a", DAY), groups: [] }], {
          grouping: DEFAULT_GROUPING,
        })[0]?.color,
      ).toBeUndefined();
    });

    it("falls back through a key's rank, path and label, and a key's label, to name and order a group", () => {
      const bare = (id: string, key: object): CalendarEventRecord => ({
        ...createRecord(id, DAY),
        groups: [[{ key: id, label: null, path: null, ...key }]],
      });
      const groups = groupCalendarEvents(
        [
          bare("b", {}),
          bare("a", { path: "Zed" }),
          bare("c", { label: "Cee", rank: "0" }),
          { ...createRecord("none", DAY), groups: [] },
          { ...createRecord("none2", DAY), groups: [] },
        ],
        { grouping: [{ field: "tag:body" }] },
      );

      expect(groups.map((group) => group.label)).toStrictEqual([
        "Cee",
        "b",
        "a",
        "Other",
      ]);
      expect(groups.at(-1)?.events).toHaveLength(2);
    });

    it("names a tie of colors by the first met", () => {
      const events = [
        { ...createRecord("a", DAY), color: "red" },
        { ...createRecord("b", DAY), color: "blue" },
        { ...createRecord("c", DAY), color: null },
      ];

      expect(
        groupCalendarEvents(events, { grouping: DEFAULT_GROUPING })[0]?.color,
      ).toBe("red");
    });

    it("groups by the first level of a grouping the user picked", () => {
      const groups = groupCalendarEvents(
        [createRecord("a", DAY, DAY, ["Body", "Sign"])],
        { grouping: [{ field: "tag:body" }] },
      );

      expect(groups.map((group) => group.label)).toStrictEqual(["Body"]);
    });
  });
});
