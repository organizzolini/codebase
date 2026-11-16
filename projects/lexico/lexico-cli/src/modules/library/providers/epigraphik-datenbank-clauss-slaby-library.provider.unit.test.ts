import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

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

  it("should write one province book with one child text per inscription", async () => {
    const authors = await ingestSample();

    const books = authors[0]?.texts ?? [];
    const romaBook = books.find((book) => book.title === "Roma");
    const hispaniaBook = books.find((book) => book.title === "Hispania");

    const unknownBook = books.find((book) => book.title === "Unknown Province");

    expect(books.map((book) => book.type)).toStrictEqual([
      "book",
      "book",
      "book",
    ]);
    expect(romaBook?.childTexts.map((text) => text.title)).toStrictEqual([
      "EDCS-1",
      "EDCS-2",
    ]);
    expect(hispaniaBook?.childTexts.map((text) => text.title)).toStrictEqual([
      "EDCS-3",
      "EDCS-7",
    ]);
    expect(unknownBook?.childTexts.map((text) => text.title)).toStrictEqual([
      "EDCS-8",
    ]);
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
    const authors = await ingestSample();

    const titles = (authors[0]?.texts ?? []).flatMap((book) =>
      book.childTexts.map((text) => text.title),
    );

    expect(titles).not.toContain("EDCS-4");
    expect(titles).not.toContain("EDCS-6");
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
