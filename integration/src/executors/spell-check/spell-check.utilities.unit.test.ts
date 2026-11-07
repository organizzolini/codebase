import { describe, expect, it } from "vitest";

import { buildCspellArguments, chargedRoots } from "./spell-check.utilities";

describe("spell-check utilities", () => {
  describe(buildCspellArguments, () => {
    it("names the configuration and a glob under each root", () => {
      const built = buildCspellArguments({
        configuration: "configuration/cspell.config.yaml",
        roots: ["projects/a", "projects/b"],
      });

      expect(built.slice(0, 2)).toStrictEqual([
        "--config",
        "configuration/cspell.config.yaml",
      ]);
      expect(built).toContain(
        "projects/a/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs,json,jsonc,json5,css,scss,html,yaml,yml,md,mdx,py,ipynb,sql}",
      );
      expect(built).toContain("--gitignore");
    });
  });

  describe(chargedRoots, () => {
    const roots = ["projects/a", "projects/b", "projects/a/nested"];

    it("charges a finding to the root that holds its file", () => {
      expect(
        chargedRoots("projects/b/x.ts:1:2 - Unknown word (zzz)", roots),
      ).toStrictEqual(new Set(["projects/b"]));
    });

    it("charges a nested project's finding to its parent as well", () => {
      expect(
        chargedRoots("projects/a/nested/x.ts:3:4 - Unknown word (zzz)", roots),
      ).toStrictEqual(new Set(["projects/a", "projects/a/nested"]));
    });

    it("does not mistake a sibling whose name starts the same for a child", () => {
      expect(
        chargedRoots("projects/ab/x.ts:1:1 - Unknown word (zzz)", roots),
      ).toStrictEqual(new Set());
    });

    it("reads a path that starts with ./ and ignores lines that are not findings", () => {
      expect(
        chargedRoots(
          "CSpell: Files checked: 2\n./projects/a/y.md:9:1 - Unknown word (zzz)",
          roots,
        ),
      ).toStrictEqual(new Set(["projects/a"]));
    });
  });
});
