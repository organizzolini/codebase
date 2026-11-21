import { describe, expect, it } from "vitest";

import {
  buildCaptureLocation,
  buildCliArguments,
  describeOptions,
} from "./codometer.utilities";

const BASE = {
  directories: [],
  options: { config: "codometer.config.ts" },
  workspaceRoot: "/workspace",
};

describe("codometer utilities", () => {
  describe(buildCliArguments, () => {
    it("always writes the report and names the project's own configuration", () => {
      expect.hasAssertions();

      expect(buildCliArguments(BASE)).toStrictEqual([
        "--import",
        "@swc-node/register/esm-register",
        "/workspace/projects/ic-suite/codometer/codometer-cli/src/codometer-cli.main.ts",
        "measure",
        "--config",
        "codometer.config.ts",
        "--output-json",
      ]);
    });

    it("gates limits only when the task asks to", () => {
      expect.hasAssertions();

      expect(
        buildCliArguments({
          ...BASE,
          options: { ...BASE.options, check: true },
        }),
      ).toStrictEqual(expect.arrayContaining(["--check", "limits"]));
    });

    it("writes no report when the task turns it off", () => {
      expect.hasAssertions();

      expect(
        buildCliArguments({
          ...BASE,
          options: { ...BASE.options, outputJson: false },
        }),
      ).not.toContain("--output-json");
    });

    it("names the only inputs ahead of the next flag, so they cannot swallow a directory", () => {
      expect.hasAssertions();

      const cliArguments = buildCliArguments({
        ...BASE,
        directories: ["/a"],
        options: { ...BASE.options, onlyInputs: ["codebase", "Other"] },
      });
      const start = cliArguments.indexOf("--only-inputs");

      expect(cliArguments.slice(start, start + 4)).toStrictEqual([
        "--only-inputs",
        "codebase",
        "Other",
        "--config",
      ]);
      expect(cliArguments.at(-1)).toBe("/a");
    });

    it("leaves the inputs alone when the task names none", () => {
      expect.hasAssertions();

      expect(buildCliArguments(BASE)).not.toContain("--only-inputs");
    });

    it("writes the badge block only when the task names a file for it", () => {
      expect.hasAssertions();

      expect(
        buildCliArguments({
          ...BASE,
          options: { ...BASE.options, outputMarkdown: "codometer.md" },
        }),
      ).toStrictEqual(
        expect.arrayContaining(["--output-markdown", "codometer.md"]),
      );
    });
  });

  it("ends the arguments with the directories to measure", () => {
    expect.hasAssertions();

    expect(
      buildCliArguments({ ...BASE, directories: ["/a", "/b"] }).slice(-2),
    ).toStrictEqual(["/a", "/b"]);
  });

  describe(buildCaptureLocation, () => {
    it("runs where it is told, under the shared tsconfig, with the extra environment", () => {
      expect.hasAssertions();

      const location = buildCaptureLocation({
        environment: { LOG_LEVEL: "silent" },
        workingDirectory: "/workspace/projects/a",
        workspaceRoot: "/workspace",
      });

      expect(location.cwd).toBe("/workspace/projects/a");
      expect(location.env?.["SWC_NODE_PROJECT"]).toBe(
        "/workspace/configuration/tsconfig.json",
      );
      expect(location.env?.["LOG_LEVEL"]).toBe("silent");
    });
  });

  describe(describeOptions, () => {
    it("describes equal measurements alike and different ones apart", () => {
      expect.hasAssertions();

      expect(describeOptions({ check: true, config: "c" })).toBe(
        describeOptions({ check: true, config: "c" }),
      );
      expect(describeOptions({ config: "c" })).toBe(
        describeOptions({ check: false, config: "c" }),
      );
      expect(describeOptions({ check: true, config: "c" })).not.toBe(
        describeOptions({ config: "c", outputMarkdown: "c.md" }),
      );
      expect(describeOptions({ config: "c" })).not.toBe(
        describeOptions({ config: "c", onlyInputs: ["codebase"] }),
      );
      expect(describeOptions({ config: "c" })).not.toBe(
        describeOptions({ config: "c", outputJson: false }),
      );
      expect(describeOptions({ config: "c" })).toBe(
        describeOptions({ config: "c", outputJson: true }),
      );
    });
  });
});
