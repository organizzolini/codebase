import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createFileTree } from "../file-tree/file-tree.utilities";

import {
  findGuideGaps,
  listExampleNames,
  removeStagedExample,
  stageExample,
} from "./example-run.utilities";

// 🧪 Tests

describe("example runs", () => {
  describe(listExampleNames, () => {
    it("lists folders alphabetically and skips files and exclusions", () => {
      const root = createFileTree({
        "a/a.txt": "",
        "b/a.txt": "",
        "c/a.txt": "",
        "notes.md": "",
      });

      expect(listExampleNames(root)).toStrictEqual(["a", "b", "c"]);
      expect(listExampleNames(root, ["b"])).toStrictEqual(["a", "c"]);
    });
  });

  describe(findGuideGaps, () => {
    it("is empty for a documented example", () => {
      const root = createFileTree({ "one/README.md": "" });

      expect(
        findGuideGaps("one", {
          examplesDirectory: root,
          packageGuide: "[one](examples/one/README.md)",
        }),
      ).toStrictEqual([]);
    });

    it("names a missing README and a missing index link", () => {
      const root = createFileTree({ "one/a.txt": "" });

      expect(
        findGuideGaps("one", { examplesDirectory: root, packageGuide: "" }),
      ).toStrictEqual([
        "one has no README.md",
        "one is not linked from the README's index table",
      ]);
    });
  });

  describe(stageExample, () => {
    it("copies the source, then adds a repository marker and files", () => {
      const source = createFileTree({ "project/a.txt": "one" });
      const parent = createFileTree({});
      const root = stageExample({
        files: { "extra/b.txt": "two" },
        git: true,
        label: "staged",
        parent,
        removeAfterTest: true,
        source: path.join(source, "project"),
      });

      expect(path.dirname(root)).toBe(fs.realpathSync(parent));
      expect(fs.readFileSync(path.join(root, "a.txt"), "utf8")).toBe("one");
      expect(fs.readFileSync(path.join(root, "extra/b.txt"), "utf8")).toBe(
        "two",
      );
      expect(fs.existsSync(path.join(root, ".git"))).toBe(true);
    });

    it("leaves removal to the caller by default", () => {
      const source = createFileTree({ "a.txt": "one" });
      const root = stageExample({ label: "kept", source });

      expect(fs.existsSync(path.join(root, ".git"))).toBe(false);

      removeStagedExample(root);

      expect(fs.existsSync(root)).toBe(false);
    });
  });
});
