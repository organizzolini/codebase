import { describe, expect, it } from "vitest";

import { compareRenderCommandHelpOptions } from "./render-command.utilities";

describe("render command utilities", () => {
  describe(compareRenderCommandHelpOptions, () => {
    it("orders options by long flag", () => {
      expect(
        [{ long: "--table" }, { long: "--dry-run" }, { long: "--limit" }]
          .toSorted(compareRenderCommandHelpOptions)
          .map(({ long }) => long),
      ).toStrictEqual(["--dry-run", "--limit", "--table"]);
    });

    it("puts the help option last", () => {
      expect(
        [{ long: "--help" }, { long: "--table" }]
          .toSorted(compareRenderCommandHelpOptions)
          .map(({ long }) => long),
      ).toStrictEqual(["--table", "--help"]);
    });

    it("keeps two options with the same flag equal", () => {
      expect(
        compareRenderCommandHelpOptions({ long: "--page" }, { long: "--page" }),
      ).toBe(0);
    });

    it("reads an option with no long flag as empty", () => {
      expect(
        compareRenderCommandHelpOptions({}, { long: "--page" }),
      ).toBeLessThan(0);
    });
  });
});
