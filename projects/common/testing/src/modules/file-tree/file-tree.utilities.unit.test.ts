import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createFileTree, writeFileTree } from "./file-tree.utilities";

// 🧪 Tests

describe("file trees", () => {
  describe(writeFileTree, () => {
    it("writes every file, creating the parent directories", () => {
      const root = createFileTree({});

      writeFileTree(root, { "a.txt": "one", "deep/nested/b.txt": "two" });

      expect(fs.readFileSync(path.join(root, "a.txt"), "utf8")).toBe("one");
      expect(
        fs.readFileSync(path.join(root, "deep/nested/b.txt"), "utf8"),
      ).toBe("two");
    });
  });

  describe(createFileTree, () => {
    let previousRoot = "";

    it("returns a root holding the files", () => {
      const root = createFileTree({ "src/main.ts": "export {};" });
      previousRoot = root;

      expect(fs.readFileSync(path.join(root, "src/main.ts"), "utf8")).toBe(
        "export {};",
      );
      expect(path.basename(root)).toContain("file-tree");
    });

    it("removes the root once its test finishes", () => {
      expect(previousRoot).not.toBe("");
      expect(fs.existsSync(previousRoot)).toBe(false);
    });

    it("names the directory after the label", () => {
      const root = createFileTree({}, { label: "glossary" });

      expect(path.basename(root)).toContain("glossary");
    });

    it("creates an empty .git directory only when asked", () => {
      const plain = createFileTree({});
      const repository = createFileTree({}, { git: true });

      expect(fs.existsSync(path.join(plain, ".git"))).toBe(false);
      expect(fs.readdirSync(path.join(repository, ".git"))).toStrictEqual([]);
    });

    it("holds the root in the parent directory, creating it when missing", () => {
      const parent = path.join(createFileTree({}), "nested");
      const root = createFileTree({}, { parent });

      expect(path.dirname(root)).toBe(fs.realpathSync(parent));
    });

    it("links each symlink path to its target under the root", () => {
      const root = createFileTree(
        { "real/file.txt": "linked" },
        { symlinks: { "links/alias": "real" } },
      );

      expect(
        fs.lstatSync(path.join(root, "links/alias")).isSymbolicLink(),
      ).toBe(true);
      expect(
        fs.readFileSync(path.join(root, "links/alias/file.txt"), "utf8"),
      ).toBe("linked");
    });
  });
});
