import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";

import { createMock, type DeepMocked } from "@golevelup/ts-vitest";
// `obj` is the field name the EDCS API returns, not an abbreviation this code chose.
// cspell:ignore obj fundort inschrifttyp datierung
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Author, textCollection } from "@codebase/lexico-db";

import { EpigraphikDatenbankClaussSlabyLibraryProvider } from "./epigraphik-datenbank-clauss-slaby-library.provider";

import type { LoggerService } from "@codebase/observability";
import type * as FileSystemHelpers from "@codebase/testing/file-system";

const mkdirMock = vi.mocked(mkdir);
const readdirMock = vi.mocked<(path: string) => Promise<string[]>>(readdir);
const readFileMock = vi.mocked(readFile);
const writeFileMock = vi.mocked(writeFile);

vi.mock("node:fs/promises", async () => {
  const { mockFileSystem } = await vi.importActual<typeof FileSystemHelpers>(
    "@codebase/testing/file-system",
  );

  return mockFileSystem();
});

/** Sample EDCS records: full, partial, empty-text, and two invalid shapes. */
const sampleRecords = {
  data: [
    {
      obj: {
        datierung_bis: 50,
        datierung_von: -50,
        "edcs-id": "EDCS-1",
        fundort: "Ostia",
        inschriften: [["<p>AVE <b>ROMA</b></p>", null, [], []]],
        inschrifttyp: "Grabinschrift",
        material: "Marmor",
        provinz: "Roma",
      },
    },
    {
      obj: {
        "edcs-id": "EDCS-2",
        inschriften: [["HIC SITUS EST", null, [], []]],
        provinz: "Roma",
      },
    },
    {
      obj: {
        "edcs-id": "EDCS-3",
        inschriften: [["VALE", null, [], []]],
        provinz: "Hispania",
      },
    },
    {
      obj: {
        "edcs-id": "EDCS-4",
        inschriften: [["", null, [], []]],
        provinz: "Roma",
      },
    },
    { obj: { inschriften: [["NO ID", null, [], []]], provinz: "Roma" } },
    { obj: { "edcs-id": "EDCS-6", provinz: "Roma" } },
    {
      obj: {
        edcsId: "EDCS-7",
        fundort: null,
        inschriften: [["VIVAS", null, [], []]],
        provinz: "Hispania",
      },
    },
    {
      obj: {
        "edcs-id": "EDCS-8",
        inschriften: [["VALE", null, [], []]],
        provinz: null,
      },
    },
  ],
};

describe(EpigraphikDatenbankClaussSlabyLibraryProvider, () => {
  const logger: DeepMocked<LoggerService> = createMock<LoggerService>();

  const provider = new EpigraphikDatenbankClaussSlabyLibraryProvider(logger);

  /** Runs ingest over one chunk of the sample records and returns the Authors. */
  async function ingestSample(options?: { text?: string }): Promise<Author[]> {
    readdirMock.mockResolvedValueOnce(["chunk-0.json"]);
    readFileMock.mockResolvedValueOnce(JSON.stringify(sampleRecords));
    return provider.ingest(options ? { ...options } : undefined);
  }

  /** The markdown written for the text at the given file name. */
  function writtenMarkdown(fileName: string): string | undefined {
    const call = writeFileMock.mock.calls.find(([filePath]) =>
      (filePath as string).endsWith(fileName),
    );
    return call?.[1] as string | undefined;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
  });

  it("should initialize the provider instance", () => {
    expect(provider).toBeDefined();
    expect(provider.name).toBe("epigraphik-datenbank-clauss-slaby");
  });

  it("should write one province book per province without holding the inscriptions", async () => {
    const authors = await ingestSample();

    const books = authors[0]?.texts ?? [];

    expect(books.map((book) => [book.title, book.type])).toStrictEqual([
      ["Roma", "book"],
      ["Hispania", "book"],
      ["Unknown Province", "book"],
    ]);
    expect(books.every((book) => book.childTexts.length === 0)).toBe(true);
  });

  it("should give each inscription its EDCS id as title, slug, and line label", async () => {
    await ingestSample();

    const paths = writeFileMock.mock.calls.map(
      ([filePath]) => filePath as string,
    );

    expect(
      paths.map((filePath) => filePath.split("/").slice(-2)),
    ).toStrictEqual([
      ["roma", "edcs-1.md"],
      ["roma", "edcs-2.md"],
      ["hispania", "edcs-3.md"],
      ["hispania", "edcs-7.md"],
      ["unknown-province", "edcs-8.md"],
    ]);
    expect(writtenMarkdown("edcs-1.md")).toContain("# EDCS-1");
    expect(writtenMarkdown("edcs-1.md")).toContain("**EDCS-1** AVE ROMA");
  });

  it("should write every attribute the record provides into frontmatter", async () => {
    await ingestSample();

    const content = writtenMarkdown("edcs-1.md");

    expect(content).toContain(`collection: ${textCollection.edcs}`);
    expect(content).toContain("province: Roma");
    expect(content).toContain("find_spot: Ostia");
    expect(content).toContain("inscription_type: Grabinschrift");
    expect(content).toContain("material: Marmor");
    expect(content).toContain("start_year: -50");
    expect(content).toContain("end_year: 50");
  });

  it("should omit attributes a partial record does not provide", async () => {
    await ingestSample();

    const content = writtenMarkdown("edcs-2.md");

    expect(content).toContain(`collection: ${textCollection.edcs}`);
    expect(content).toContain("province: Roma");
    expect(content).not.toContain("find_spot");
    expect(content).not.toContain("start_year");
    expect(content).toContain("**EDCS-2** HIC SITUS EST");
  });

  it("should skip records without inscription text and log invalid records without stopping", async () => {
    await ingestSample();

    expect(writtenMarkdown("edcs-4.md")).toBeUndefined();
    expect(writtenMarkdown("edcs-6.md")).toBeUndefined();
    expect(writeFileMock).toHaveBeenCalledTimes(5);
    expect(logger.warn).toHaveBeenCalledWith(
      "📄 Skipped invalid EDCS record",
      undefined,
      expect.objectContaining({ file: "chunk-0.json", index: 4 }),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      "📄 Skipped invalid EDCS record",
      undefined,
      expect.objectContaining({ file: "chunk-0.json", index: 5 }),
    );
  });

  it("should honor the text filter against an inscription's slug", async () => {
    await ingestSample({
      text: "epigraphik-datenbank-clauss-slaby/hispania/edcs-3",
    });

    expect(writeFileMock).toHaveBeenCalledTimes(1);
    expect(writeFileMock.mock.calls[0]?.[0]).toContain("edcs-3.md");
  });

  it("should stream a large province chunk by chunk without accumulating it", async () => {
    const chunkCount = 5;
    const perChunk = 400;
    const chunk = (chunkIndex: number): string =>
      JSON.stringify({
        data: Array.from({ length: perChunk }, (_unused, index) => ({
          obj: {
            "edcs-id": `EDCS-${chunkIndex}-${index}`,
            fundort: "Ostia",
            inschriften: [["AVE", null, [], []]],
            inschrifttyp: "Grabinschrift",
            material: "Marmor",
            provinz: "Roma",
          },
        })),
      });
    readdirMock.mockResolvedValueOnce(
      Array.from(
        { length: chunkCount },
        (_unused, index) => `chunk-${index}.json`,
      ),
    );
    for (let index = 0; index < chunkCount; index++) {
      readFileMock.mockResolvedValueOnce(chunk(index));
    }

    const authors = await provider.ingest();

    expect(writeFileMock).toHaveBeenCalledTimes(chunkCount * perChunk);
    expect(authors[0]?.texts).toHaveLength(1);
    expect(authors[0]?.texts[0]?.childTexts).toHaveLength(0);
  });

  it("should clear stale generated files before a full run but not a filtered one", async () => {
    await ingestSample();

    expect(vi.mocked(rm)).toHaveBeenCalledWith(
      expect.stringContaining("epigraphik-datenbank-clauss-slaby"),
      { force: true, recursive: true },
    );

    vi.mocked(rm).mockClear();
    await ingestSample({
      text: "epigraphik-datenbank-clauss-slaby/roma/edcs-1",
    });

    expect(vi.mocked(rm)).not.toHaveBeenCalled();
  });

  it("should log and skip a duplicate EDCS id instead of overwriting it", async () => {
    readdirMock.mockResolvedValueOnce(["chunk-0.json"]);
    readFileMock.mockResolvedValueOnce(
      JSON.stringify({
        data: [
          {
            obj: {
              "edcs-id": "EDCS-1",
              inschriften: [["A", null]],
              provinz: "Roma",
            },
          },
          {
            obj: {
              "edcs-id": "edcs 1",
              inschriften: [["B", null]],
              provinz: "Roma",
            },
          },
        ],
      }),
    );
    writeFileMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        Object.assign(new Error("exists"), { code: "EEXIST" }),
      );

    await provider.ingest();

    expect(logger.warn).toHaveBeenCalledWith(
      "📄 Skipped duplicate EDCS id",
      undefined,
      { id: "edcs 1", slug: "epigraphik-datenbank-clauss-slaby/roma/edcs-1" },
    );
  });

  it("should rethrow a write failure that is not a duplicate", async () => {
    readdirMock.mockResolvedValueOnce(["chunk-0.json"]);
    readFileMock.mockResolvedValueOnce(JSON.stringify(sampleRecords));
    writeFileMock.mockRejectedValueOnce(new Error("disk full"));

    await provider.ingest();

    expect(logger.warn).toHaveBeenCalledWith(
      "📄 Failed reading chunk file",
      undefined,
      expect.objectContaining({ reason: "Error: disk full" }),
    );
  });

  it("should log attribute coverage and warn when an attribute is missing nearly everywhere", async () => {
    readdirMock.mockResolvedValueOnce(["chunk-0.json"]);
    readFileMock.mockResolvedValueOnce(
      JSON.stringify({
        data: Array.from({ length: 20 }, (_unused, index) => ({
          obj: {
            datierung_bis: 5,
            datierung_von: 1,
            "edcs-id": `EDCS-${index}`,
            inschriften: [["AVE", null]],
            inschrifttyp: "Grabinschrift",
            material: "Marmor",
            provinz: "Roma",
          },
        })),
      }),
    );

    await provider.ingest();

    expect(logger.info).toHaveBeenCalledWith(
      "📊 Measured EDCS attribute coverage",
      undefined,
      { missing: { find_spot: 20 }, records: 20 },
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("missing on nearly every record"),
      undefined,
      { affected: ["find_spot"], records: 20 },
    );
  });

  it("should not warn about missing attributes on a handful of records", async () => {
    await ingestSample();

    expect(logger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining("missing on nearly every record"),
      expect.anything(),
      expect.anything(),
    );
  });

  it("should return empty when chunk files cannot be read", async () => {
    readdirMock.mockRejectedValueOnce(new Error("missing"));

    const authors = await provider.ingest();

    expect(authors).toStrictEqual([]);
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      undefined,
      expect.objectContaining({ sourceDataDirectory: expect.any(String) }),
    );
  });

  it("should return empty when author filter does not match", async () => {
    const authors = await provider.ingest({ author: "other-provider" });

    expect(authors).toStrictEqual([]);
  });
});
