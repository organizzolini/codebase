import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";
import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { UnreadableTargetFileError } from "./size.constants";
import { SizeService } from "./size.service";

import type { CodometerCompression } from "@codometer/configuration";
import type { DeepMocked } from "@golevelup/ts-vitest";
import type * as NodeFileSystem from "node:fs";

// Reads stay real except for one sentinel path, which throws a bare string:
// a thrown literal is not an Error, and the measurement still has to report
// which file it gave up on. Real files are staged in a temporary directory.
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof NodeFileSystem>();

  return {
    ...actual,
    readFileSync: (filePath: string) => {
      if (filePath.endsWith("odd.js")) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw "not an Error";
      }

      return actual.readFileSync(filePath);
    },
  };
});

/** The two files measured here, keyed by relative path. */
const FILE_CONTENTS: Readonly<Record<string, string>> = {
  "dist/alpha.js": "export const alpha = 1;\n",
  "dist/beta.js": "export const beta = 2;\n",
};

/** Bytes these two files report under each compression, permanently. */
const PINNED_BYTES: Readonly<Record<CodometerCompression, number>> = {
  brotli: 55,
  gzip: 87,
  none: 47,
};

describe(SizeService, () => {
  let service: SizeService;
  let loggerService: DeepMocked<LoggerService>;

  let workingDirectory: string;

  /** Measures both fixture files under one compression. */
  function analyze(compression: CodometerCompression): number {
    return service.analyze({
      compression,
      files: ["dist/alpha.js", "dist/beta.js"],
      workingDirectory,
    }).bytes;
  }

  beforeAll(async () => {
    const { instance, module } = await buildTestingModule(SizeService);

    service = instance;
    loggerService = await module.resolve(LoggerService);
  });

  beforeEach(() => {
    workingDirectory = createTemporaryDirectory("size");

    for (const [fileName, contents] of Object.entries(FILE_CONTENTS)) {
      const filePath = path.join(workingDirectory, fileName);

      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, contents, "utf8");
    }
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SizeService);

    expect(instance).toBeInstanceOf(SizeService);
  });

  it.each(["brotli", "gzip", "none"] as const)(
    "reports the same %s bytes it always has",
    (compression) => {
      expect(analyze(compression)).toBe(PINNED_BYTES[compression]);
    },
  );

  it("reports which compression the bytes were measured under", () => {
    expect(
      service.analyze({
        compression: "brotli",
        files: ["dist/alpha.js"],
        workingDirectory,
      }),
    ).toStrictEqual({ bytes: 28, compression: "brotli", files: 1 });
  });

  // Reporting the other files and calling the total a measurement would be a
  // number short by one file that still looks internally consistent, which is
  // exactly how a real breach passes.
  it("fails rather than reporting a total it could not measure", () => {
    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/alpha.js", "dist/gone.js"],
        workingDirectory,
      }),
    ).toThrow(UnreadableTargetFileError);
  });

  it("names the file it could not read and why", () => {
    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/gone.js"],
        workingDirectory,
      }),
    ).toThrow(
      `Cannot measure ${path.join(workingDirectory, "dist/gone.js")}: Error: ENOENT`,
    );
  });

  it("logs the file it could not measure before rethrowing", () => {
    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/gone.js"],
        workingDirectory,
      }),
    ).toThrow(UnreadableTargetFileError);

    expect(loggerService.error).toHaveBeenCalledWith(
      "🗜️ Failed to measure a target file",
      undefined,
      expect.objectContaining({
        path: path.join(workingDirectory, "dist/gone.js"),
      }),
    );
  });

  it("logs the reason for a thrown value that is not an Error", () => {
    writeFileSync(path.join(workingDirectory, "dist/odd.js"), "", "utf8");

    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/odd.js"],
        workingDirectory,
      }),
    ).toThrow(UnreadableTargetFileError);

    expect(loggerService.error).toHaveBeenCalledWith(
      "🗜️ Failed to measure a target file",
      undefined,
      {
        path: path.join(workingDirectory, "dist/odd.js"),
        reason: "not an Error",
      },
    );
  });
});
