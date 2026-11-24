import { describe, expect, it } from "vitest";

import {
  flattenGroupRuns,
  labelGroupRun,
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
    it("names a run by its root and the tags it groups beneath", () => {
      const [run] = toGroupRuns([
        { field: ASPECT },
        { field: ASPECT, parent: "compound" },
      ]);

      expect(run === undefined ? "" : labelGroupRun(run, FIELDS)).toBe(
        "Aspect › Compound",
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
});
