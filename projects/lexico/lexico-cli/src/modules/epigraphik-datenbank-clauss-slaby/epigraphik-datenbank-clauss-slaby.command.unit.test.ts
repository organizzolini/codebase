import { existsSync } from "node:fs";
import { access, appendFile, mkdir, writeFile } from "node:fs/promises";

import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";
import { expectLoggerContext } from "@codebase/observability/testing";
import {
  buildTestingModule,
  mockErrorLogEntries,
  setErrorLogFilePath,
} from "@codebase/testing/nestjs";

import { resetCommandTestHarness } from "../../../testing/command-harness";

import { EpigraphikDatenbankClaussSlabyCommand } from "./epigraphik-datenbank-clauss-slaby.command";

import type * as FileSystemHelpers from "@codebase/testing/file-system";
import type { BuiltTestingModule } from "@codebase/testing/nestjs";

const existsSyncMock = vi.mocked(existsSync);

const accessMock = vi.mocked(access);
const appendFileMock = vi.mocked(appendFile);
const mkdirMock = vi.mocked(mkdir);
const writeFileMock = vi.mocked(writeFile);

vi.mock("node:fs", async () => {
  const { mockFileSystem } = await vi.importActual<typeof FileSystemHelpers>(
    "@codebase/testing/file-system",
  );

  return mockFileSystem();
});

vi.mock("node:fs/promises", async () => {
  const { mockFileSystem } = await vi.importActual<typeof FileSystemHelpers>(
    "@codebase/testing/file-system",
  );

  return mockFileSystem();
});

describe(EpigraphikDatenbankClaussSlabyCommand, () => {
  let command: EpigraphikDatenbankClaussSlabyCommand;
  let logger: BuiltTestingModule<EpigraphikDatenbankClaussSlabyCommand>["logger"];

  beforeAll(async () => {
    const built = await buildTestingModule(
      EpigraphikDatenbankClaussSlabyCommand,
    );

    command = built.instance;
    logger = built.logger;
  });

  beforeEach(() => {
    resetCommandTestHarness();
    existsSyncMock.mockReturnValue(true);
    mkdirMock.mockResolvedValue(undefined);
    appendFileMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    logger.createTimestampedOutputLogFilePath.mockReturnValue(
      "/tmp/edcs-errors.log",
    );
    mockErrorLogEntries(logger);
    setErrorLogFilePath(command, "/tmp/edcs-errors.log");
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      EpigraphikDatenbankClaussSlabyCommand,
    );

    expect(instance).toBeInstanceOf(EpigraphikDatenbankClaussSlabyCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(EpigraphikDatenbankClaussSlabyCommand);
  });

  it("should create output directory when it does not exist", async () => {
    const bootstrapLogger = createMock<LoggerService>();
    bootstrapLogger.createTimestampedOutputLogFilePath.mockReturnValue(
      "/tmp/edcs-errors.log",
    );

    await buildTestingModule(EpigraphikDatenbankClaussSlabyCommand, {
      providers: [
        {
          provide: LoggerService,
          useValue: bootstrapLogger,
        },
      ],
    });

    expect(
      bootstrapLogger.createTimestampedOutputLogFilePath,
    ).toHaveBeenCalledWith("edcs");
  });

  it("should save chunk data and stop when payload has no records", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            json: async () => await Promise.resolve({ data: [] }),
            ok: true,
          }),
      ),
    );

    const shouldContinue = await (
      command as unknown as {
        saveChunkData: (start: number, chunkFile: string) => Promise<boolean>;
      }
    ).saveChunkData(0, "/tmp/chunk-0.json");

    expect(shouldContinue).toBe(false);
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("should save chunk data and continue when fetch is successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            json: async () => await Promise.resolve({ data: [{ id: 1 }] }),
            ok: true,
          }),
      ),
    );

    const shouldContinue = await (
      command as unknown as {
        saveChunkData: (start: number, chunkFile: string) => Promise<boolean>;
      }
    ).saveChunkData(1000, "/tmp/chunk-1000.json");

    expect(shouldContinue).toBe(true);
    expect(writeFileMock).toHaveBeenCalledTimes(1);
  });

  it("should warn and continue when save chunk response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            ok: false,
            statusText: "Too Many Requests",
          }),
      ),
    );

    const shouldContinue = await (
      command as unknown as {
        saveChunkData: (start: number, chunkFile: string) => Promise<boolean>;
      }
    ).saveChunkData(2000, "/tmp/chunk-2000.json");

    expect(shouldContinue).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith("🌐 Failed fetching records");
  });

  it("should warn and continue when chunk payload parsing fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            json: async () => await Promise.resolve({ records: [{ id: 1 }] }),
            ok: true,
          }),
      ),
    );

    const shouldContinue = await (
      command as unknown as {
        saveChunkData: (start: number, chunkFile: string) => Promise<boolean>;
      }
    ).saveChunkData(3000, "/tmp/chunk-3000.json");

    expect(shouldContinue).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(
      "🌐 Received an unexpected EDCS payload shape",
    );
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("should skip chunk download when chunk file already exists", async () => {
    accessMock.mockResolvedValueOnce(undefined);

    const result = await (
      command as unknown as {
        downloadChunkIfMissing: (start: number) => Promise<boolean>;
      }
    ).downloadChunkIfMissing(0);

    expect(result).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      "⏭️ Skipping chunk that already exists",
      undefined,
      expect.any(Object),
    );
  });

  it("should download missing chunk through chunk-data workflow", async () => {
    accessMock.mockRejectedValueOnce(new Error("missing"));

    vi.spyOn(
      command as unknown as {
        downloadChunkData: (
          start: number,
          chunkFile: string,
        ) => Promise<boolean>;
      },
      "downloadChunkData",
    ).mockResolvedValueOnce(false);

    const result = await (
      command as unknown as {
        downloadChunkIfMissing: (start: number) => Promise<boolean>;
      }
    ).downloadChunkIfMissing(1000);

    expect(result).toBe(false);
  });

  it("should handle chunk download errors and append error log", async () => {
    vi.spyOn(
      command as unknown as {
        saveChunkData: (start: number, chunkFile: string) => Promise<boolean>;
      },
      "saveChunkData",
    ).mockRejectedValueOnce(new Error("network"));

    const result = await (
      command as unknown as {
        downloadChunkData: (
          start: number,
          chunkFile: string,
        ) => Promise<boolean>;
      }
    ).downloadChunkData(0, "/tmp/chunk-0.json");

    expect(result).toBe(true);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(appendFileMock).toHaveBeenCalledTimes(1);
  });

  it("should stringify non-Error failures when chunk download throws", async () => {
    vi.spyOn(
      command as unknown as {
        saveChunkData: (start: number, chunkFile: string) => Promise<boolean>;
      },
      "saveChunkData",
    ).mockRejectedValueOnce("network-failure");

    const result = await (
      command as unknown as {
        downloadChunkData: (
          start: number,
          chunkFile: string,
        ) => Promise<boolean>;
      }
    ).downloadChunkData(0, "/tmp/chunk-0.json");

    expect(result).toBe(true);
    expect(logger.error).toHaveBeenCalledWith(
      "🌐 Failed fetching chunk",
      expect.any(String),
      expect.any(Object),
    );
    expect(appendFileMock).toHaveBeenCalledTimes(1);
  });

  it("should run and stop when a chunk signals no further data", async () => {
    const downloadSpy = vi
      .spyOn(
        command as unknown as {
          downloadChunkIfMissing: (start: number) => Promise<boolean>;
        },
        "downloadChunkIfMissing",
      )
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await command.run();

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledTimes(2);
    expect(downloadSpy).toHaveBeenNthCalledWith(1, 0);
    expect(downloadSpy).toHaveBeenNthCalledWith(2, 1000);
    expect(logger.info).toHaveBeenCalledWith("📥 Downloaded chunks");
  });
});
