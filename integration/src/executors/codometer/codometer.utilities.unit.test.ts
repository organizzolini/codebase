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
    });
  });
});
