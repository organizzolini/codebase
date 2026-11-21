import { describe, expect, it } from "vitest";

import { buildCommand, describeOptions } from "./executor.utilities";

describe("the measure executor's utilities", () => {
  describe(buildCommand, () => {
    it("names the inputs before the configuration, and the directories last", () => {
      expect.hasAssertions();

      expect(
        buildCommand({
          directories: ["/w/a", "/w/b"],
          options: {
            check: true,
            command: "codometer",
            config: "configuration/codometer.config.ts",
            onlyInputs: ["codebase"],
            outputJson: "codometer-limit-report.json",
            outputMarkdown: "documentation/codometer.md",
          },
        }),
      ).toBe(
        "codometer batch --only-inputs 'codebase' --config 'configuration/codometer.config.ts' --output-json 'codometer-limit-report.json' --check limits --output-markdown 'documentation/codometer.md' '/w/a' '/w/b'",
      );
    });

    it("leaves out every flag it was not given", () => {
      expect.hasAssertions();

      expect(
        buildCommand({
          directories: [],
          options: { command: "codometer", config: "c.ts" },
        }),
      ).toBe("codometer batch --config 'c.ts'");
    });

    it("quotes a single quote in a path for the shell", () => {
      expect.hasAssertions();

      expect(
        buildCommand({
          directories: ["/w/it's"],
          options: { command: "codometer", config: "c.ts" },
        }),
      ).toContain(String.raw`'/w/it'\''s'`);
    });
  });

  describe(describeOptions, () => {
    it("tells apart measurements that differ in any option", () => {
      expect.hasAssertions();

      const base = { command: "codometer", config: "c.ts" };

      expect(describeOptions(base)).toBe(describeOptions({ ...base }));

      for (const changed of [
        { check: true },
        { onlyInputs: ["codebase"] },
        { outputJson: "r.json" },
        { outputMarkdown: "m.md" },
        { config: "d.ts" },
        { command: "other" },
      ]) {
        expect(describeOptions({ ...base, ...changed })).not.toBe(
          describeOptions(base),
        );
      }
    });
  });
});
