import { describe, expect, it } from "vitest";

import {
  matchesDirectoryPattern,
  resolveWorkspaceRootRelativePath,
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

  describe(resolveWorkspaceRootRelativePath, () => {
    it("climbs one folder more than the directory is deep", () => {
      expect(
        resolveWorkspaceRootRelativePath({
          directoryPath: "/ws/projects",
          workspaceRoot: "/ws",
        }),
      ).toBe("../../");
      expect(
        resolveWorkspaceRootRelativePath({
          directoryPath: "/ws/projects/caelundas",
          workspaceRoot: "/ws",
        }),
      ).toBe("../../../");
    });
  });
});
