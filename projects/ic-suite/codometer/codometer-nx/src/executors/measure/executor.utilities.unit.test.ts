import { describe, expect, it } from "vitest";

import { buildCommand, describeOptions } from "./executor.utilities";

describe("the measure executor's utilities", () => {
  describe(buildCommand, () => {
    it("names the directories first, then the flags, the bare output flags last", () => {
      expect.hasAssertions();

      expect(
        buildCommand({
          directories: ["/w/a", "/w/b"],
          options: {
            check: true,
            command: "codometer",
            config: "configuration/codometer.config.ts",
            outputJson: true,
            outputMarkdown: true,
          },
        }),
      ).toBe(
        "codometer measure '/w/a' '/w/b' --config 'configuration/codometer.config.ts' --check limits --output-json --output-markdown",
      );
    });

    it("leaves out every flag it was not given", () => {
      expect.hasAssertions();

      expect(
        buildCommand({
          directories: [],
          options: { command: "codometer", config: "c.ts" },
        }),
      ).toBe("codometer measure --config 'c.ts'");
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
        { outputJson: true },
        { outputMarkdown: true },
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
