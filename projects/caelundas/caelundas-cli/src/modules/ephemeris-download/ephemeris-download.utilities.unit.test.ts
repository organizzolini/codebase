import fs from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import {
  createTemporaryDirectory,
  useWorkingDirectory,
} from "@codebase/testing";

import {
  EPHEMERIS_FILENAMES,
  EphemerisFilesMissingError,
} from "./ephemeris-download.constants";
import {
  assertEphemerisFilesPresent,
  findMissingEphemerisFiles,
  isEphemerisFilePresent,
  resolveEphemerisDirectory,
} from "./ephemeris-download.utilities";

describe("ephemeris-download utilities", () => {
  let directory: string;

  /** Writes every data file, or the first `count` of them, with content. */
  const writeFiles = (count: number = EPHEMERIS_FILENAMES.length): void => {
    for (const filename of EPHEMERIS_FILENAMES.slice(0, count)) {
      fs.writeFileSync(path.join(directory, filename), "data");
    }
  };

  beforeEach(() => {
    directory = createTemporaryDirectory("ephemeris");
  });

  describe(resolveEphemerisDirectory, () => {
    it("resolves the data directory from the working directory", () => {
      useWorkingDirectory(directory);

      expect(resolveEphemerisDirectory()).toBe(
        path.join(directory, "data", "ephemeris"),
      );
    });
  });

  describe(isEphemerisFilePresent, () => {
    it("is true for a file with content", () => {
      writeFiles(1);

      expect(
        isEphemerisFilePresent(path.join(directory, EPHEMERIS_FILENAMES[0])),
      ).toBe(true);
    });

    it("is false for a file that does not exist", () => {
      expect(isEphemerisFilePresent(path.join(directory, "absent"))).toBe(
        false,
      );
    });

    it("is false for an empty file, which is a failed download", () => {
      const file = path.join(directory, "empty.se1");
      fs.writeFileSync(file, "");

      expect(isEphemerisFilePresent(file)).toBe(false);
    });
  });

  describe(findMissingEphemerisFiles, () => {
    it("finds nothing missing when every file is there", () => {
      writeFiles();

      expect(findMissingEphemerisFiles(directory)).toStrictEqual([]);
    });

    it("finds every file missing from an empty directory", () => {
      expect(findMissingEphemerisFiles(directory)).toStrictEqual([
        ...EPHEMERIS_FILENAMES,
      ]);
    });

    it("finds only the files that are absent or empty", () => {
      writeFiles(1);
      fs.writeFileSync(path.join(directory, EPHEMERIS_FILENAMES[1]), "");

      expect(findMissingEphemerisFiles(directory)).toStrictEqual([
        EPHEMERIS_FILENAMES[1],
        EPHEMERIS_FILENAMES[2],
      ]);
    });

    it("treats a directory that does not exist as missing every file", () => {
      expect(
        findMissingEphemerisFiles(path.join(directory, "nowhere")),
      ).toHaveLength(EPHEMERIS_FILENAMES.length);
    });
  });

  describe(assertEphemerisFilesPresent, () => {
    it("does not throw when every file is there", () => {
      writeFiles();

      expect(() => {
        assertEphemerisFilesPresent(directory);
      }).not.toThrow();
    });

    it("throws naming the directory, each missing file, and the download command", () => {
      writeFiles(1);

      expect(() => {
        assertEphemerisFilesPresent(directory);
      }).toThrow(EphemerisFilesMissingError);
      expect(() => {
        assertEphemerisFilesPresent(directory);
      }).toThrow(
        `${directory}: ${EPHEMERIS_FILENAMES[1]}, ${EPHEMERIS_FILENAMES[2]}. Download them with \`nx run caelundas-cli:download-ephemeris\`.`,
      );
    });

    it("checks the data directory under the working directory by default", () => {
      useWorkingDirectory(directory);

      expect(() => {
        assertEphemerisFilesPresent();
      }).toThrow(path.join(directory, "data", "ephemeris"));
    });

    it("carries the directory and the missing files", () => {
      let caught: unknown;

      try {
        assertEphemerisFilesPresent(directory);
      } catch (error) {
        caught = error;
      }

      expect(caught).toMatchObject({
        directory,
        missing: [...EPHEMERIS_FILENAMES],
        name: "EphemerisFilesMissingError",
      });
    });
  });
});
