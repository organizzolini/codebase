import { describe, expect, it } from "vitest";

import {
  matchesDirectoryPattern,
  staticDirectoryPrefix,
} from "./paths.utilities";

describe("paths utilities", () => {
  describe(matchesDirectoryPattern, () => {
    it("lets a wildcard stand for exactly one folder", () => {
      expect(
        matchesDirectoryPattern({
          directory: "projects/caelundas",
          pattern: "projects/*",
        }),
      ).toBe(true);
      expect(
        matchesDirectoryPattern({
          directory: "projects/a/b",
          pattern: "projects/*",
        }),
      ).toBe(false);
    });

    it("lets a double wildcard stand for any number of folders, none included", () => {
      for (const directory of [
        "projects",
        "projects/caelundas",
        "projects/ic-suite/conformetry",
      ]) {
        expect(
          matchesDirectoryPattern({ directory, pattern: "projects/**" }),
        ).toBe(true);
      }

      expect(
        matchesDirectoryPattern({
          directory: "packages",
          pattern: "projects/**",
        }),
      ).toBe(false);
    });

    it("matches a literal pattern only against itself", () => {
      expect(
        matchesDirectoryPattern({ directory: "projects", pattern: "projects" }),
      ).toBe(true);
      expect(
        matchesDirectoryPattern({ directory: "packages", pattern: "projects" }),
      ).toBe(false);
    });

    it("treats regular-expression characters in a segment literally", () => {
      expect(
        matchesDirectoryPattern({
          directory: "projectsX",
          pattern: "projects.",
        }),
      ).toBe(false);
    });
  });

  describe(staticDirectoryPrefix, () => {
    it("stops at the first wildcard segment", () => {
      expect(staticDirectoryPrefix("projects/*/*")).toBe("projects");
      expect(staticDirectoryPrefix("projects")).toBe("projects");
    });
  });
});
