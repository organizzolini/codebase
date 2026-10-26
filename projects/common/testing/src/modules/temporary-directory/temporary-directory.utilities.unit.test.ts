import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import { TEMPORARY_DIRECTORY_PREFIX } from "./temporary-directory.constants";
import {
  createTemporaryDirectory,
  useTemporaryDirectory,
} from "./temporary-directory.utilities";

// 🧪 Tests

describe("temporary directories", () => {
  describe(createTemporaryDirectory, () => {
    let created = "";

    it("creates an empty directory under the system's temporary directory, named for its label", () => {
      created = createTemporaryDirectory("capture");

      expect(path.dirname(created)).toBe(fs.realpathSync(os.tmpdir()));
      expect(path.basename(created)).toMatch(
        new RegExp(`^${TEMPORARY_DIRECTORY_PREFIX}capture-`, "u"),
      );
      expect(fs.readdirSync(created)).toStrictEqual([]);
    });

    it("removes the directory once the test that made it finishes", () => {
      expect(created).not.toBe("");
      expect(fs.existsSync(created)).toBe(false);
    });

    it("gives every call its own directory", () => {
      expect(createTemporaryDirectory("same")).not.toBe(
        createTemporaryDirectory("same"),
      );
    });

    describe("from a beforeEach hook", () => {
      let directory = "";

      beforeEach(() => {
        directory = createTemporaryDirectory("hook");
        fs.writeFileSync(path.join(directory, "file.txt"), "contents");
      });

      it("lasts through the test", () => {
        expect(fs.readdirSync(directory)).toStrictEqual(["file.txt"]);

        created = directory;
      });

      it("is removed, contents and all, after the test", () => {
        expect(fs.existsSync(created)).toBe(false);
      });
    });
  });

  describe(useTemporaryDirectory, () => {
    let suiteDirectory = "";

    describe("inside its suite", () => {
      const directory = useTemporaryDirectory("suite");

      it("creates one directory before the suite's first test", () => {
        suiteDirectory = directory();
        fs.writeFileSync(path.join(suiteDirectory, "kept.txt"), "kept");

        expect(path.basename(suiteDirectory)).toMatch(
          new RegExp(`^${TEMPORARY_DIRECTORY_PREFIX}suite-`, "u"),
        );
      });

      it("keeps the same directory, contents and all, across the suite's tests", () => {
        expect(directory()).toBe(suiteDirectory);
        expect(fs.readdirSync(suiteDirectory)).toStrictEqual(["kept.txt"]);
      });
    });

    it("removes the directory once its suite has finished", () => {
      expect(suiteDirectory).not.toBe("");
      expect(fs.existsSync(suiteDirectory)).toBe(false);
    });

    describe("read before its suite has started", () => {
      const directory = useTemporaryDirectory("early");
      let thrown: unknown;

      try {
        directory();
      } catch (error) {
        thrown = error;
      }

      it("throws rather than handing out no path", () => {
        expect(thrown).toBeInstanceOf(Error);
      });
    });
  });
});
