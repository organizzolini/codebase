import { describe, expect, it } from "vitest";

import { attributeIssues, buildKnipArguments } from "./knip.utilities";

describe("knip utilities", () => {
  describe(buildKnipArguments, () => {
    const base = {
      configuration: "configuration/knip.config.ts",
      directory: "/workspace",
      fix: false,
      format: "native",
      roots: ["projects/a"],
    } as const;

    it("names the configuration, the directory and each workspace", () => {
      expect(
        buildKnipArguments({ ...base, roots: ["projects/a", "projects/b"] }),
      ).toStrictEqual([
        "--config",
        "configuration/knip.config.ts",
        "--directory",
        "/workspace",
        "--workspace",
        "projects/a",
        "--workspace",
        "projects/b",
      ]);
    });

    it("asks for the JSON report only when told to", () => {
      expect(buildKnipArguments({ ...base, format: "json" })).toStrictEqual(
        expect.arrayContaining(["--reporter", "json"]),
      );
      expect(buildKnipArguments(base)).not.toContain("--reporter");
    });

    it("fixes only when told to", () => {
      expect(buildKnipArguments({ ...base, fix: true })).toContain("--fix");
      expect(buildKnipArguments(base)).not.toContain("--fix");
    });
  });

  describe(attributeIssues, () => {
    /** A knip JSON report with one issue entry per file. */
    function report(files: string[]): string {
      return JSON.stringify({
        issues: files.map((file) => ({ file, files: [{ name: file }] })),
      });
    }

    it("counts each issue under the workspace its file sits in", () => {
      expect(
        attributeIssues(
          report([
            "projects/a/src/x.ts",
            "projects/a/src/y.ts",
            "projects/b/z.ts",
          ]),
          ["projects/a", "projects/b", "projects/c"],
        ),
      ).toStrictEqual({
        byRoot: new Map([
          ["projects/a", 2],
          ["projects/b", 1],
        ]),
        unattributed: 0,
      });
    });

    it("gives a file to the deepest workspace that holds it", () => {
      // A nested workspace's files are also under its parent's directory.
      expect(
        attributeIssues(report(["projects/a/nested/x.ts"]), [
          "projects/a",
          "projects/a/nested",
        ]),
      ).toStrictEqual({
        byRoot: new Map([["projects/a/nested", 1]]),
        unattributed: 0,
      });
    });

    it("does not mistake a sibling whose name starts the same for a child", () => {
      expect(
        attributeIssues(report(["projects/ab/x.ts"]), ["projects/a"]),
      ).toStrictEqual({ byRoot: new Map<string, number>(), unattributed: 1 });
    });

    it("counts a file outside every workspace as unattributed", () => {
      expect(
        attributeIssues(report(["infrastructure/project.json"]), [
          "projects/a",
        ]),
      ).toStrictEqual({ byRoot: new Map<string, number>(), unattributed: 1 });
    });

    it("reads an empty report as no issues", () => {
      expect(attributeIssues('{"issues":[]}', ["projects/a"])).toStrictEqual({
        byRoot: new Map<string, number>(),
        unattributed: 0,
      });
    });

    it.each([
      ["text that is not JSON", "not json"],
      ["JSON with no issues list", "{}"],
      ["an issue with no file", '{"issues":[{"files":[]}]}'],
      ["JSON that is a list rather than a report", "[]"],
      ["an issue that is not an object", '{"issues":[5]}'],
    ])("refuses %s rather than reading it as clean", (_name, output) => {
      expect(attributeIssues(output, ["projects/a"])).toBeUndefined();
    });
  });
});
