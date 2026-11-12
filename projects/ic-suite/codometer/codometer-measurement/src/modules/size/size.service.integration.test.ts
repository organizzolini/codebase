import { gzipSync } from "node:zlib";

import { beforeAll, describe, expect, it } from "vitest";

import { useTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import {
  createTargetTree,
  TARGET_FIXTURE_FILES,
} from "../../../testing/target-tree";

import { GZIP_LEVEL, UnreadableTargetFileError } from "./size.constants";
import { SizeService } from "./size.service";

import type { CodometerCompression } from "@codometer/configuration";

/** Two fixtures: one compresses by deflate level, one is small. */
const MEASURED_FILES = ["dist/index.js", "dist/nested/deep.js"];

/** Expected byte counts per compression, so call changes fail here. */
const PINNED_BYTES: Readonly<Record<CodometerCompression, number>> = {
  brotli: 504,
  gzip: 825,
  none: 6906,
};

/** Same files compressed at zlib's default level, not 9. */
const DEFAULT_LEVEL_BYTES = 924;

describe(`${SizeService.name} over real files`, () => {
  const readTemporaryDirectory = useTemporaryDirectory("codometer-target");
  let service: SizeService;
  let workingDirectory: string;

  /** Measures the fixture's files under one compression. */
  function analyze(
    compression: CodometerCompression,
    files: string[] = MEASURED_FILES,
  ): number {
    return service.analyze({ compression, files, workingDirectory }).bytes;
  }

  beforeAll(async () => {
    const { instance } = await buildTestingModule(SizeService);

    service = instance;
    workingDirectory = createTargetTree(readTemporaryDirectory());
  });

  it.each(["brotli", "gzip", "none"] as const)(
    "reports the same %s bytes it always has",
    (compression) => {
      expect.hasAssertions();
      expect(analyze(compression)).toBe(PINNED_BYTES[compression]);
    },
  );

  it("compresses at level 9 rather than at zlib's default", () => {
    expect.hasAssertions();
    // The default is 6 and gives a different answer for these same files, so
    // this is the assertion that fails if the level ever goes unstated.
    expect(GZIP_LEVEL).toBe(9);
    expect(analyze("gzip")).not.toBe(DEFAULT_LEVEL_BYTES);
  });

  it("compresses each file on its own and sums the results", () => {
    expect.hasAssertions();

    const separately = MEASURED_FILES.map(
      (filePath) =>
        gzipSync(TARGET_FIXTURE_FILES[filePath] ?? "", { level: GZIP_LEVEL })
          .length,
    ).reduce((total, bytes) => total + bytes, 0);
    const together = gzipSync(
      MEASURED_FILES.map((filePath) => TARGET_FIXTURE_FILES[filePath]).join(""),
      { level: GZIP_LEVEL },
    ).length;

    expect(analyze("gzip")).toBe(separately);
    // Compressing them together finds matches across the boundary between
    // them, which reports fewer bytes than any client will ever receive.
    expect(analyze("gzip")).toBeGreaterThan(together);
  });

  it("reports nothing for a target holding no files", () => {
    expect.hasAssertions();
    expect(
      service.analyze({ compression: "gzip", files: [], workingDirectory }),
    ).toStrictEqual({
      bytes: 0,
      compression: "gzip",
      files: 0,
    });
  });

  it("fails when a matched file has gone missing", () => {
    expect.hasAssertions();
    // A build running beside the measurement is enough to lose a file between
    // matching it and reading it, and the total would then be short by that
    // file with nothing in the report to say so.
    expect(() =>
      analyze("gzip", [...MEASURED_FILES, "dist/vanished.js"]),
    ).toThrow(UnreadableTargetFileError);
  });
});
