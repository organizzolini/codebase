import { describe, expect, it } from "vitest";

import {
  flattenGroupRuns,
  iconGroupRun,
  labelGroupRun,
  listGroupChipNames,
  pathGroupRun,
  toGroupRuns,
  toRunLevels,
} from "./calendar-group-strip-runs.utilities";
import { toGrouping, toGroupValue } from "./calendar-group-strip.utilities";
import { createEventGroupFields } from "./components/event-group-model/event-group-fields.utilities";

const FIELDS = createEventGroupFields([
  {
    id: "aspect",
    name: "Aspect",
    values: [
      { count: 3, depth: 1, id: "simple", name: "Simple", path: "Simple" },
      {
        count: 2,
        depth: 2,
        id: "major",
        name: "Major",
        path: "Simple / Major",
      },
      {
        count: 1,
        depth: 3,
        id: "conjunct",
        name: "Conjunct",
        path: "Simple / Major / Conjunct",
      },
      {
        count: 2,
        depth: 1,
        id: "compound",
        name: "Compound",
        path: "Compound",
      },
      {
        count: 1,
        depth: 2,
        id: "stellium",
        name: "Stellium",
        path: "Compound / Stellium",
      },
    ],
  },
]);
const ASPECT = "tag:aspect";

describe("group runs", () => {
  describe(toGroupRuns, () => {
    it("gathers consecutive levels of one field into one run", () => {
      const runs = toGroupRuns([
        { field: ASPECT },
        { field: ASPECT, parent: "compound" },
        { field: "period" },
      ]);

      expect(runs.map((run) => run.levels.length)).toStrictEqual([2, 1]);
    });

    it("round-trips through flattenGroupRuns", () => {
      const levels = [{ field: ASPECT }, { field: ASPECT, parent: "simple" }];

      expect(flattenGroupRuns(toGroupRuns(levels))).toStrictEqual(levels);
    });
  });

  describe(toRunLevels, () => {
    it("lists the grouping's level indexes each run covers", () => {
      const runs = toGroupRuns([
        { field: ASPECT },
        { field: ASPECT, parent: "compound" },
        { field: "period" },
      ]);

      expect(toRunLevels(runs)).toStrictEqual([[0, 1], [2]]);
    });
  });

  describe(labelGroupRun, () => {
    it("names a run by the tags it groups beneath, not their path", () => {
      const [run] = toGroupRuns([
        { field: ASPECT },
        { field: ASPECT, parent: "compound" },
      ]);

      expect(run === undefined ? "" : labelGroupRun(run, FIELDS)).toBe(
        "Compound",
      );
    });

    it("names a run of the root's own children by the root", () => {
      const [run] = toGroupRuns([{ field: ASPECT }]);

      expect(run === undefined ? "" : labelGroupRun(run, FIELDS)).toBe(
        "Aspect",
      );
    });
  });

  describe(pathGroupRun, () => {
    it("writes the root, then the tags beneath it", () => {
      const [run] = toGroupRuns([
        { field: ASPECT },
        { field: ASPECT, parent: "compound" },
      ]);

      expect(run === undefined ? "" : pathGroupRun(run, FIELDS)).toBe(
        "Aspect › Compound",
      );
    });

    it("writes the root alone for its own children", () => {
      const [run] = toGroupRuns([{ field: ASPECT }]);

      expect(run === undefined ? "" : pathGroupRun(run, FIELDS)).toBe("Aspect");
    });
  });

  describe(iconGroupRun, () => {
    it("leads with the tag's own icon beneath a tag, else the root's", () => {
      const [beneath] = toGroupRuns([{ field: ASPECT, parent: "compound" }]);
      const [own] = toGroupRuns([{ field: ASPECT }]);
      const compound = FIELDS.find((field) => field.id === ASPECT)?.nodes.find(
        (node) => node.id === "compound",
      );

      expect(beneath === undefined ? "" : iconGroupRun(beneath, FIELDS)).toBe(
        compound?.icon,
      );
      expect(own === undefined ? "" : iconGroupRun(own, FIELDS)).toBe(
        FIELDS.find((field) => field.id === ASPECT)?.icon,
      );
    });
  });

  describe(toGrouping, () => {
    it("keeps sibling tags ticked one after another", () => {
      const first = toGrouping(
        [ASPECT, "compound"],
        [{ field: ASPECT }],
        FIELDS,
      );
      const second = toGrouping(
        [...toGroupValue(first), "simple"],
        first,
        FIELDS,
      );

      expect(second.map((level) => level.parent)).toStrictEqual([
        undefined,
        "compound",
        "simple",
      ]);
    });
  });

  describe(listGroupChipNames, () => {
    const state = {
      groupIds: ["/0:alpha", "/0:beta"],
      picked: [
        { color: undefined, id: "/0:alpha", label: "Alpha" },
        { color: undefined, id: "/0:gone", label: "Gone" },
      ],
    };

    it("names a chip for each run, then each group picked that the layout still holds", () => {
      expect(
        listGroupChipNames({
          fields: FIELDS,
          isDefaultGrouping: false,
          runs: toGroupRuns([{ field: ASPECT }, { field: "year" }]),
          state,
          view: "charts",
        }),
      ).toStrictEqual(["Aspect", "Year", "Alpha"]);
    });

    it("names no picked group in a view that lists none", () => {
      expect(
        listGroupChipNames({
          fields: FIELDS,
          isDefaultGrouping: false,
          runs: toGroupRuns([{ field: ASPECT }]),
          state,
          view: "month",
        }),
      ).toStrictEqual(["Aspect"]);
    });

    it("names the one Tags chip of the default grouping", () => {
      expect(
        listGroupChipNames({
          fields: FIELDS,
          isDefaultGrouping: true,
          runs: [],
          state: { groupIds: [], picked: [] },
          view: "table",
        }),
      ).toStrictEqual(["Tags"]);
    });
  });
});
