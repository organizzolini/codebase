import { existsSync, mkdirSync } from "node:fs";
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

import { CorpusScriptorumEcclesiasticorumLatinorumCommand } from "./corpus-scriptorum-ecclesiasticorum-latinorum.command";

import type * as FileSystemHelpers from "@codebase/testing/file-system";
import type { BuiltTestingModule } from "@codebase/testing/nestjs";

const existsSyncMock = vi.mocked(existsSync);
const mkdirSyncMock = vi.mocked(mkdirSync);
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

describe(CorpusScriptorumEcclesiasticorumLatinorumCommand, () => {
  let command: CorpusScriptorumEcclesiasticorumLatinorumCommand;
  let logger: BuiltTestingModule<CorpusScriptorumEcclesiasticorumLatinorumCommand>["logger"];

  beforeAll(async () => {
    const built = await buildTestingModule(
      CorpusScriptorumEcclesiasticorumLatinorumCommand,
    );

    command = await built.module.resolve(
      CorpusScriptorumEcclesiasticorumLatinorumCommand,
    );
    logger = built.logger;
  });

  beforeEach(() => {
    resetCommandTestHarness();

    accessMock.mockClear();
    appendFileMock.mockClear();
    existsSyncMock.mockClear();
    mkdirMock.mockClear();
    mkdirSyncMock.mockClear();
    writeFileMock.mockClear();
    logger.log.mockClear();
    logger.warn.mockClear();
    logger.error.mockClear();
    logger.createTimestampedOutputLogFilePath.mockReturnValue(
      "/tmp/csel-errors.log",
    );
    mockErrorLogEntries(logger);

    existsSyncMock.mockReturnValue(true);
    mkdirMock.mockResolvedValue(undefined);
    appendFileMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    setErrorLogFilePath(command, "/tmp/csel-errors.log");
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      CorpusScriptorumEcclesiasticorumLatinorumCommand,
    );

    expect(instance).toBeInstanceOf(
      CorpusScriptorumEcclesiasticorumLatinorumCommand,
    );
  });

  it("sets logger context", async () => {
    await expectLoggerContext(CorpusScriptorumEcclesiasticorumLatinorumCommand);
  });

  it("should create output directory when it does not exist", async () => {
    const bootstrapLogger = createMock<LoggerService>();
    bootstrapLogger.createTimestampedOutputLogFilePath.mockReturnValue(
      "/tmp/csel-errors.log",
    );

    await buildTestingModule(CorpusScriptorumEcclesiasticorumLatinorumCommand, {
      providers: [
        {
          provide: LoggerService,
          useValue: bootstrapLogger,
        },
      ],
    });

    expect(
      bootstrapLogger.createTimestampedOutputLogFilePath,
    ).toHaveBeenCalledWith("csel");
  });

  it("should fetch tree and return null on response failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            ok: false,
            statusText: "Bad Request",
          }),
      ),
    );

    const result = await (
      command as unknown as {
        fetchTree: (
          treeUrl: string,
        ) => Promise<null | { path: string; type: string }[]>;
      }
    ).fetchTree("https://example.com/tree");

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      "🌳 Failed fetching the CSEL tree",
    );
  });

  it("should fetch tree and return nodes on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            json: async () =>
              await Promise.resolve({
                tree: [
                  { path: "data/foo.xml", type: "blob" },
                  { path: "README.md", type: "blob" },
                ],
              }),
            ok: true,
          }),
      ),
    );

    const result = await (
      command as unknown as {
        fetchTree: (
          treeUrl: string,
        ) => Promise<null | { path: string; type: string }[]>;
      }
    ).fetchTree("https://example.com/tree");

    expect(result).toStrictEqual([
      { path: "data/foo.xml", type: "blob" },
      { path: "README.md", type: "blob" },
    ]);
  });

  it("should return null when tree payload parsing fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            json: async () => await Promise.resolve({ tree: [{ path: 1 }] }),
            ok: true,
          }),
      ),
    );

    const result = await (
      command as unknown as {
        fetchTree: (
          treeUrl: string,
        ) => Promise<null | { path: string; type: string }[]>;
      }
    ).fetchTree("https://example.com/tree");

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      "🌳 Failed parsing the CSEL tree response",
    );
  });

  it("should fetch and write xml file on successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            ok: true,
            text: async () => await Promise.resolve("<xml>ok</xml>"),
          }),
      ),
    );

    await (
      command as unknown as {
        fetchAndWriteXmlFile: (
          fileUrl: string,
          targetPath: string,
        ) => Promise<void>;
      }
    ).fetchAndWriteXmlFile("https://example.com/file.xml", "/tmp/file.xml");

    expect(writeFileMock).toHaveBeenCalledWith(
      "/tmp/file.xml",
      "<xml>ok</xml>",
      "utf8",
    );
  });

  it("should warn and skip write on failed xml response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(...parameters: unknown[]) => unknown>(
        async () =>
          await Promise.resolve({
            ok: false,
            statusText: "Not Found",
          }),
      ),
    );

    await (
      command as unknown as {
        fetchAndWriteXmlFile: (
          fileUrl: string,
          targetPath: string,
        ) => Promise<void>;
      }
    ).fetchAndWriteXmlFile("https://example.com/file.xml", "/tmp/file.xml");

    expect(logger.warn).toHaveBeenCalledWith("📥 Failed fetching", undefined, {
      fileUrl: "https://example.com/file.xml",
    });
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("should skip download when xml file already exists", async () => {
    accessMock.mockResolvedValueOnce(undefined);

    await (
      command as unknown as {
        downloadSourceXmlFileIfMissing: (xmlPath: string) => Promise<void>;
      }
    ).downloadSourceXmlFileIfMissing("data/author/work.xml");

    expect(logger.info).toHaveBeenCalledWith(
      "⏭️ Skipping already downloaded",
      undefined,
      { xmlPath: "data/author/work.xml" },
    );
  });

  it("should download missing xml file and log errors on failure", async () => {
    accessMock.mockRejectedValueOnce(new Error("missing"));

    const fetchAndWriteXmlFileSpy = vi
      .spyOn(
        command as unknown as {
          fetchAndWriteXmlFile: (
            fileUrl: string,
            targetPath: string,
          ) => Promise<void>;
        },
        "fetchAndWriteXmlFile",
      )
      .mockRejectedValueOnce(new Error("network"));

    await (
      command as unknown as {
        downloadSourceXmlFileIfMissing: (xmlPath: string) => Promise<void>;
      }
    ).downloadSourceXmlFileIfMissing("data/author/work.xml");

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(fetchAndWriteXmlFileSpy).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(appendFileMock).toHaveBeenCalledTimes(1);
  });

  it("should stringify non-Error failures when download throws", async () => {
    accessMock.mockRejectedValueOnce(new Error("missing"));

    vi.spyOn(
      command as unknown as {
        fetchAndWriteXmlFile: (
          fileUrl: string,
          targetPath: string,
        ) => Promise<void>;
      },
      "fetchAndWriteXmlFile",
    ).mockRejectedValueOnce("network-failure");

    await (
      command as unknown as {
        downloadSourceXmlFileIfMissing: (xmlPath: string) => Promise<void>;
      }
    ).downloadSourceXmlFileIfMissing("data/author/work.xml");

    expect(logger.error).toHaveBeenCalledWith(
      "📥 Failed downloading",
      expect.any(String),
      { xmlPath: "data/author/work.xml" },
    );
    expect(appendFileMock).toHaveBeenCalledTimes(1);
  });

  it("should run and download only eligible xml tree entries", async () => {
    vi.spyOn(
      command as unknown as {
        fetchTree: (
          treeUrl: string,
        ) => Promise<null | { path: string; type: string }[]>;
      },
      "fetchTree",
    ).mockResolvedValueOnce([
      { path: "data/author/work.xml", type: "blob" },
      { path: "data/author/__cts__.xml", type: "blob" },
      { path: "docs/readme.txt", type: "blob" },
      { path: "data/author/subfolder", type: "tree" },
    ]);

    const downloadSpy = vi
      .spyOn(
        command as unknown as {
          downloadSourceXmlFileIfMissing: (xmlPath: string) => Promise<void>;
        },
        "downloadSourceXmlFileIfMissing",
      )
      .mockResolvedValue(undefined);

    await command.run();

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledWith("data/author/work.xml");
    expect(logger.info).toHaveBeenCalledWith("📥 Downloaded CSEL source files");
  });

  it("should return early when tree fetch fails in run", async () => {
    vi.spyOn(
      command as unknown as {
        fetchTree: (
          treeUrl: string,
        ) => Promise<null | { path: string; type: string }[]>;
      },
      "fetchTree",
    ).mockResolvedValueOnce(null);

    const downloadSpy = vi.spyOn(
      command as unknown as {
        downloadSourceXmlFileIfMissing: (xmlPath: string) => Promise<void>;
      },
      "downloadSourceXmlFileIfMissing",
    );

    await command.run();

    expect(downloadSpy).not.toHaveBeenCalled();
  });
});
