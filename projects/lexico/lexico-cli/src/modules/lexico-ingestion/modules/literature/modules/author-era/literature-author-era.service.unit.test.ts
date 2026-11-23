import { setTimeout as sleep } from "node:timers/promises";

import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Author, Text } from "@codebase/lexico-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { createRepositoryMock } from "../../../../../../../testing/mocks";

import { LiteratureAuthorEraService } from "./literature-author-era.service";

vi.mock("node:timers/promises", () => ({
  setTimeout: vi.fn<() => Promise<void>>().mockResolvedValue(),
}));

function createAuthor(slug: string, years: Partial<Author> = {}): Author {
  return Object.assign(new Author(), { id: `${slug}-id`, slug }, years);
}

function wikidataResponse(binding: Record<string, string>): Response {
  const entries = Object.entries(binding).map(([key, value]) => [
    key,
    { value },
  ]);
  return Response.json({
    results: { bindings: [Object.fromEntries(entries)] },
  });
}

describe(LiteratureAuthorEraService, () => {
  const fetchMock = vi.fn<typeof fetch>();
  let service: LiteratureAuthorEraService;
  let authors: ReturnType<typeof createRepositoryMock<Author>>;
  let texts: ReturnType<typeof createRepositoryMock<Text>>;
  let logger: Awaited<ReturnType<typeof buildTestingModule>>["logger"];

  async function dateAuthors(
    author: Author,
    sourceUrl?: string,
  ): Promise<void> {
    vi.mocked(authors.find).mockResolvedValue([author]);
    vi.mocked(texts.findOne).mockResolvedValue(
      sourceUrl
        ? Object.assign(new Text(), { metadata: { source_url: sourceUrl } })
        : null,
    );
    await service.dateAuthors();
  }

  beforeEach(async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    const built = await buildTestingModule(LiteratureAuthorEraService, {
      providers: [
        {
          provide: getRepositoryToken(Author),
          useValue: createRepositoryMock<Author>(),
        },
        {
          provide: getRepositoryToken(Text),
          useValue: createRepositoryMock<Text>(),
        },
      ],
    });
    service = built.instance;
    logger = built.logger;
    authors = built.module.get(getRepositoryToken(Author));
    texts = built.module.get(getRepositoryToken(Text));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(LiteratureAuthorEraService, {
      providers: [
        {
          provide: getRepositoryToken(Author),
          useValue: createRepositoryMock<Author>(),
        },
        {
          provide: getRepositoryToken(Text),
          useValue: createRepositoryMock<Text>(),
        },
      ],
    });

    expect(instance).toBeInstanceOf(LiteratureAuthorEraService);
  });

  it("derives the era from dates the source already gave, without asking Wikidata", async () => {
    await dateAuthors(createAuthor("tacitus", { endYear: 120, startYear: 56 }));

    expect(authors.update).toHaveBeenCalledWith(
      { id: "tacitus-id" },
      { endYear: 120, era: "Imperial", startYear: 56 },
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fills dates from the Wikidata match on the PHI number, with BCE years negative", async () => {
    fetchMock.mockResolvedValue(
      wikidataResponse({
        birth: "-0042-03-18T00:00:00Z",
        death: "0017-01-01T00:00:00Z",
      }),
    );

    await dateAuthors(
      createAuthor("ovid"),
      "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0959/phi006/phi0959.phi006.perseus-lat2.xml",
    );

    expect(authors.update).toHaveBeenCalledWith(
      { id: "ovid-id" },
      { endYear: 17, era: "Classical", startYear: -43 },
    );

    // TypeORM pages a find with an eager relation by id, so a select without the id fails in Postgres.
    expect(texts.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({ id: true, metadata: true }),
      }),
    );

    const [url, init] = fetchMock.mock.calls[0] ?? [];

    expect(url as string).toContain(encodeURIComponent('"959"'));
    expect(new Headers(init?.headers).get("User-Agent")).toBe(
      "lexico-ingestion",
    );
  });

  it("uses the floruit when the match has no birth and death", async () => {
    fetchMock.mockResolvedValue(
      wikidataResponse({ floruit: "0100-01-01T00:00:00Z" }),
    );

    await dateAuthors(
      createAuthor("columella"),
      "https://example.test/data/phi0845/phi001/phi0845.phi001.perseus-lat2.xml",
    );

    expect(authors.update).toHaveBeenCalledWith(
      { id: "columella-id" },
      { endYear: 100, era: "Imperial", startYear: 100 },
    );
  });

  it("falls back to the committed table for an author with no matchable identifier", async () => {
    await dateAuthors(
      createAuthor("bede-the-venerable"),
      "https://example.test/data/stoa0054/stoa001/stoa0054.stoa001.perseus-lat1.xml",
    );

    expect(authors.update).toHaveBeenCalledWith(
      { id: "bede-the-venerable-id" },
      { endYear: 735, era: "Medieval", startYear: 673 },
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs an author with no match and leaves it untouched", async () => {
    fetchMock.mockResolvedValue(wikidataResponse({}));

    await dateAuthors(
      createAuthor("pseudo-caesar"),
      "https://example.test/data/phi0426/phi001/phi0426.phi001.perseus-lat2.xml",
    );

    expect(authors.update).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      "📅 Left authors without dates",
      undefined,
      { authors: ["pseudo-caesar"] },
    );
  });

  it("ignores a match whose death precedes its birth", async () => {
    fetchMock.mockResolvedValue(
      wikidataResponse({
        birth: "0100-01-01T00:00:00Z",
        death: "0050-01-01T00:00:00Z",
      }),
    );

    await dateAuthors(
      createAuthor("unlikely-author"),
      "https://example.test/data/phi0860/phi001/phi0860.phi001.perseus-lat2.xml",
    );

    expect(authors.update).not.toHaveBeenCalled();
  });

  it.each([
    [-101, "Archaic"],
    [-100, "Classical"],
    [13, "Classical"],
    [14, "Imperial"],
    [199, "Imperial"],
    [200, "Late"],
    [599, "Late"],
    [600, "Medieval"],
    [1299, "Medieval"],
    [1300, "Neo-Latin"],
  ])("gives an author dated %i the %s era", async (year, era) => {
    await dateAuthors(
      createAuthor("boundary", { endYear: year, startYear: year }),
    );

    expect(authors.update).toHaveBeenCalledWith(
      { id: "boundary-id" },
      { endYear: year, era, startYear: year },
    );
  });

  it("reads a year-boundary date from Wikidata as the year it belongs to", async () => {
    fetchMock.mockResolvedValue(
      wikidataResponse({
        birth: "-0106-12-31T00:00:00Z",
        birthPrecision: "9",
        death: "-0042-12-05T00:00:00Z",
        deathPrecision: "11",
      }),
    );

    await dateAuthors(
      createAuthor("cicero"),
      "https://example.test/data/phi0474/phi053/phi0474.phi053.perseus-lat2.xml",
    );

    expect(authors.update).toHaveBeenCalledWith(
      { id: "cicero-id" },
      { endYear: -43, era: "Classical", startYear: -106 },
    );
  });

  it("ignores a date too coarse to name a year", async () => {
    fetchMock.mockResolvedValue(
      wikidataResponse({
        birth: "0100-01-01T00:00:00Z",
        birthPrecision: "7",
        death: "0200-01-01T00:00:00Z",
        deathPrecision: "7",
      }),
    );

    await dateAuthors(
      createAuthor("vague"),
      "https://example.test/data/phi0861/phi001/phi0861.phi001.perseus-lat2.xml",
    );

    expect(authors.update).not.toHaveBeenCalled();
  });

  it("takes the earliest of several claims", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        results: {
          bindings: [
            {
              birth: { value: "0040-01-01T00:00:00Z" },
              death: { value: "0100-01-01T00:00:00Z" },
            },
            {
              birth: { value: "0039-01-01T00:00:00Z" },
              death: { value: "0102-01-01T00:00:00Z" },
            },
          ],
        },
      }),
    );

    await dateAuthors(
      createAuthor("claimed"),
      "https://example.test/data/phi0862/phi001/phi0862.phi001.perseus-lat2.xml",
    );

    expect(authors.update).toHaveBeenCalledWith(
      { id: "claimed-id" },
      { endYear: 100, era: "Imperial", startYear: 39 },
    );
  });

  it("ignores a lone birth, since the ticket takes only a pair or a floruit", async () => {
    fetchMock.mockResolvedValue(
      wikidataResponse({ birth: "0040-01-01T00:00:00Z" }),
    );

    await dateAuthors(
      createAuthor("lone"),
      "https://example.test/data/phi0863/phi001/phi0863.phi001.perseus-lat2.xml",
    );

    expect(authors.update).not.toHaveBeenCalled();
  });

  it("backs off and retries after HTTP 429, honouring Retry-After", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response("", { headers: { "Retry-After": "3" }, status: 429 }),
      )
      .mockResolvedValueOnce(
        wikidataResponse({
          birth: "0040-01-01T00:00:00Z",
          death: "0100-01-01T00:00:00Z",
        }),
      );
    vi.mocked(sleep).mockClear();

    await dateAuthors(
      createAuthor("busy"),
      "https://example.test/data/phi0864/phi001/phi0864.phi001.perseus-lat2.xml",
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(vi.mocked(sleep)).toHaveBeenCalledWith(3000);
    expect(authors.update).toHaveBeenCalledWith(
      { id: "busy-id" },
      { endYear: 100, era: "Imperial", startYear: 40 },
    );
  });

  it("gives up after a capped number of 429 answers and logs it", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 429 }));

    await dateAuthors(
      createAuthor("blocked"),
      "https://example.test/data/phi0865/phi001/phi0865.phi001.perseus-lat2.xml",
    );

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(authors.update).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      "📅 Failed looking up an author on Wikidata",
      undefined,
      expect.objectContaining({ reason: "Wikidata answered 429" }),
    );
  });

  it.each([
    ["a network failure", () => fetchMock.mockRejectedValue(new Error("down"))],
    [
      "an error status",
      () => fetchMock.mockResolvedValue(new Response("", { status: 500 })),
    ],
    [
      "a malformed body",
      () => fetchMock.mockResolvedValue(Response.json({ results: "none" })),
    ],
  ])("logs %s and carries on", async (_name, failWith) => {
    failWith();

    await dateAuthors(
      createAuthor("ovid"),
      "https://example.test/data/phi0959/phi006/phi0959.phi006.perseus-lat2.xml",
    );

    expect(authors.update).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      "📅 Failed looking up an author on Wikidata",
      undefined,
      expect.objectContaining({ slug: "ovid" }),
    );
  });
});
