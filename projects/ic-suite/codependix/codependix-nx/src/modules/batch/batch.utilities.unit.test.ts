import { describe, expect, it } from "vitest";

import {
  describeError,
  readChargedProjects,
  splitProjects,
} from "./batch.utilities";

describe("batch utilities", () => {
  describe(splitProjects, () => {
    it("answers nothing for no projects", () => {
      expect(splitProjects([], 900, 4)).toStrictEqual([]);
    });

    it("spreads the projects round-robin across the runs asked for", () => {
      // Round-robin rather than in blocks: adjacent names are often the same
      // family of project, and a family tends to cost alike.
      expect(
        splitProjects(["a", "b", "c", "d", "e", "f", "g", "h"], 900, 4),
      ).toStrictEqual([
        ["a", "e"],
        ["b", "f"],
        ["c", "g"],
        ["d", "h"],
      ]);
    });

    it("makes no more runs than there are projects", () => {
      expect(splitProjects(["a", "b"], 900, 4)).toStrictEqual([["a"], ["b"]]);
    });

    it("adds runs until every argument fits the byte budget", () => {
      const names = Array.from({ length: 30 }, (_unused, index) => {
        return `project-with-a-long-name-${String(index)}`;
      });
      const runs = splitProjects(names, 300, 2);

      expect(runs.length).toBeGreaterThan(2);
      expect(runs.every((run) => run.join(",").length <= 300)).toBe(true);
      expect(runs.flat().toSorted()).toStrictEqual(names.toSorted());
    });

    it("still gives a name longer than the budget a run of its own", () => {
      expect(splitProjects(["x".repeat(50), "y"], 10, 1)).toStrictEqual([
        ["x".repeat(50)],
        ["y"],
      ]);
    });
  });

  describe(readChargedProjects, () => {
    /** A `--format json` report whose findings are charged to the given projects. */
    function report(args: {
      failures?: string[][];
      violations?: string[][];
    }): string {
      return JSON.stringify({
        boundaries: {
          failures: (args.failures ?? []).map((projects) => ({ projects })),
          judgedProjects: [],
          violations: (args.violations ?? []).map((projects) => ({
            projects,
          })),
        },
      });
    }

    it("collects every project a violation or a failure is charged to", () => {
      expect(
        readChargedProjects(
          report({ failures: [["c"]], violations: [["a", "b"], ["a"]] }),
        ),
      ).toStrictEqual(new Set(["a", "b", "c"]));
    });

    it("finds the report among log lines printed to the same stream", () => {
      // A logger that shares standard output with the report must not turn a
      // readable verdict into "no report": the report is what is looked for.
      const pretty = JSON.stringify(
        {
          boundaries: {
            failures: [],
            judgedProjects: [],
            violations: [{ projects: ["a"] }],
          },
        },
        null,
        2,
      );

      expect(
        readChargedProjects(
          `[12:00:00.000] INFO: starting\n${pretty}\n[12:00:01.000] INFO: done\n`,
        ),
      ).toStrictEqual(new Set(["a"]));
    });

    it("ignores a project name that is not a string rather than refusing the report", () => {
      expect(
        readChargedProjects(
          '{"boundaries":{"failures":[],"violations":[{"projects":["a",7,null]}]}}',
        ),
      ).toStrictEqual(new Set(["a"]));
    });

    it("reads a clean report as charging nobody", () => {
      expect(readChargedProjects(report({}))).toStrictEqual(new Set());
    });

    it.each([
      ["text that is not JSON", "not json"],
      ["JSON without a boundaries report", "{}"],
      ["JSON that is not an object", "[1,2]"],
      [
        "a finding that is not an object",
        '{"boundaries":{"failures":[],"violations":[5]}}',
      ],
      ["a report with no findings lists", '{"boundaries":{}}'],
      [
        "a finding charged to no list of projects",
        '{"boundaries":{"failures":[],"violations":[{"rule":"x"}]}}',
      ],
    ])("refuses %s rather than reading it as clean", (_name, output) => {
      expect(readChargedProjects(output)).toBeUndefined();
    });
  });

  describe(describeError, () => {
    it("gives an error's message", () => {
      expect(describeError(new Error("spawn ENOENT"))).toBe("spawn ENOENT");
    });

    it.each([
      ["a string", "boom", "boom"],
      ["a number", 7, "7"],
      ["an object with no message", { code: 1 }, "[object Object]"],
    ])(
      "describes %s that was thrown in place of an error",
      (_name, thrown, expected) => {
        expect(describeError(thrown)).toBe(expected);
      },
    );
  });
});
