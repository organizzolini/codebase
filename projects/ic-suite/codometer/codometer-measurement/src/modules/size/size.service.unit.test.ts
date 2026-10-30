import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { UnreadableTargetFileError } from "./size.constants";
import { SizeService } from "./size.service";

import type { LoggerService } from "@codebase/observability";
import type { CodometerCompression } from "@codometer/configuration";
import type { DeepMocked } from "@golevelup/ts-vitest";
import type * as NodeFileSystem from "node:fs";

// Reading is mocked down to the one call the measurement makes, so the bytes
// under test come from the compression rather than from a temporary directory.
// Real files are measured in `size.service.integration.test.ts`.
const { readFileSyncMock } = vi.hoisted(() => ({
  readFileSyncMock: vi.fn<(filePath: string) => Buffer>(),
}));

vi.mock("node:fs", async (importOriginal) => {
  const { mockFileSystem } = await import("@codebase/testing/mocks");
  const actual = await importOriginal<typeof NodeFileSystem>();

  return mockFileSystem(actual, { buffer: readFileSyncMock });
});

/** The two files every measurement here is made of, keyed by absolute path. */
const FILE_CONTENTS: Readonly<Record<string, string>> = {
  "/repo/dist/alpha.js": "export const alpha = 1;\n",
  "/repo/dist/beta.js": "export const beta = 2;\n",
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

  /** Measures both fixture files under one compression. */
  function analyze(compression: CodometerCompression): number {
    return service.analyze({
      compression,
      files: ["dist/alpha.js", "dist/beta.js"],
      workingDirectory: "/repo",
    }).bytes;
  }

  beforeAll(async () => {
    const { instance, logger } = await buildTestingModule(SizeService);

    service = instance;
    loggerService = logger;
  });

  beforeEach(() => {
    readFileSyncMock.mockReset();
    readFileSyncMock.mockImplementation((filePath: string) => {
      const contents = FILE_CONTENTS[filePath];

      if (contents === undefined) {
        throw new Error(`ENOENT: ${filePath}`);
      }

      return Buffer.from(contents);
    });
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
        workingDirectory: "/repo",
      }),
    ).toStrictEqual({ bytes: 28, compression: "brotli", files: 1 });
  });

  it("reads each file once, relative to the measured directory", () => {
    analyze("gzip");

    expect(readFileSyncMock).toHaveBeenCalledTimes(2);
    expect(readFileSyncMock).toHaveBeenCalledWith("/repo/dist/alpha.js");
  });

  // Reporting the other files and calling the total a measurement would be a
  // number short by one file that still looks internally consistent, which is
  // exactly how a real breach passes.
  it("fails rather than reporting a total it could not measure", () => {
    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/alpha.js", "dist/gone.js"],
        workingDirectory: "/repo",
      }),
    ).toThrow(UnreadableTargetFileError);
  });

  it("names the file it could not read and why", () => {
    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/gone.js"],
        workingDirectory: "/repo",
      }),
    ).toThrow(
      "Cannot measure /repo/dist/gone.js: Error: ENOENT: /repo/dist/gone.js",
    );
  });

  it("logs the file it could not measure before rethrowing", () => {
    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/gone.js"],
        workingDirectory: "/repo",
      }),
    ).toThrow(UnreadableTargetFileError);

    expect(loggerService.error).toHaveBeenCalledWith(
      "🗜️ Failed to measure a target file",
      undefined,
      expect.objectContaining({ path: "/repo/dist/gone.js" }),
    );
  });

  it("logs the reason for a thrown value that is not an Error", () => {
    readFileSyncMock.mockImplementationOnce(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw "not an Error";
    });

    expect(() =>
      service.analyze({
        compression: "gzip",
        files: ["dist/odd.js"],
        workingDirectory: "/repo",
      }),
    ).toThrow(UnreadableTargetFileError);

    expect(loggerService.error).toHaveBeenCalledWith(
      "🗜️ Failed to measure a target file",
      undefined,
      { path: "/repo/dist/odd.js", reason: "not an Error" },
    );
  });
});
