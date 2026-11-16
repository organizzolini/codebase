/* cspell:words Fasti Syrus Sententiae Maro mynors Tarraconensis Narbonensis */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Author } from "@codebase/lexico-db";

import { DATABASE_TIMEOUT_MILLISECONDS } from "../../../testing/database";
import {
  type LibraryApplication,
  startLibraryApplication,
} from "../../../testing/library-application";
import { LIBRARY_INSCRIPTION_COUNT } from "../../../testing/library-catalog";

/** A library page as the `LIBRARY` query selects one. */
interface LibraryPageNode {
  readonly authors: {
    readonly author: {
      readonly endYear: null | number;
      readonly era: null | string;
      readonly fullName: null | string;
      readonly name: string;
      readonly startYear: null | number;
    };
    readonly matches: MatchNode[];
    readonly textCount: number;
    readonly texts: {
      readonly matches: MatchNode[];
      readonly text: {
        readonly collection: null | string;
        readonly edition: null | string;
        readonly parentText: null | { readonly title: string };
        readonly title: string;
      };
    }[];
  }[];
  readonly pageCount: number;
  readonly totalCount: number;
}

/** A match range as the `library` query selects one. */
interface MatchNode {
  readonly end: number;
  readonly field: string;
  readonly start: number;
}

/** Runs one page of the library. */
const LIBRARY = `
  query Library(
    $search: String
    $page: Int
    $pageSize: Int
    $filters: LibraryFilters
    $sort: LibrarySort
  ) {
    library(
      search: $search
      page: $page
      pageSize: $pageSize
      filters: $filters
      sort: $sort
    ) {
      totalCount
      pageCount
      authors {
        author { name fullName era startYear endYear }
        matches { field start end }
        textCount
        texts {
          matches { field start end }
          text { title collection edition parentText { title } }
        }
      }
    }
  }
`;

/** Lists the values the data-driven filters offer. */
const FACETS = `
  query LibraryFacets {
    libraryFacets {
      provinces { value count }
      inscriptionTypes { value count }
      materials { value count }
    }
  }
`;

/**
 * Executes the `library` query over HTTP against the whole Lexico API and a
 * real database seeded with the library catalog.
 */
describe("library resolver end-to-end suite", () => {
  let application: LibraryApplication;

  /** Runs the library query with the given variables, expecting success. */
  async function library(
    variables: Record<string, unknown> = {},
  ): Promise<LibraryPageNode> {
    const body = await application.execute(LIBRARY, variables);

    expect(body.errors).toBeUndefined();

    if (!body.data) {
      throw new Error("GraphQL returned no data");
    }
    return (body.data as { library: LibraryPageNode }).library;
  }

  beforeAll(async () => {
    application = await startLibraryApplication();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("lists every author in name order with no search", async () => {
    expect.hasAssertions();

    const page = await library();

    expect(page.totalCount).toBe(5);
    expect(page.pageCount).toBe(1);
    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Caesar",
      "Catullus",
      "Ovid",
      "Roman Inscriptions",
      "Vergil",
    ]);

    for (const card of page.authors) {
      expect(card.matches).toStrictEqual([]);
    }
  });

  it("exposes the author attributes and carries every text of an author", async () => {
    expect.hasAssertions();

    const page = await library({ search: "vergil" });
    const [card] = page.authors;

    expect(card?.author).toStrictEqual({
      endYear: -19,
      era: "CLASSICAL",
      fullName: "Publius Vergilius Maro",
      name: "Vergil",
      startYear: -70,
    });
    expect(card?.matches).toStrictEqual([
      { end: 14, field: "fullName", start: 8 },
      { end: 6, field: "name", start: 0 },
    ]);
    expect(card?.textCount).toBe(4);
    expect(card?.texts.map(({ text }) => text.title)).toStrictEqual([
      "Aeneid",
      "Book I",
      "Eclogues",
      "Eclogues",
    ]);

    for (const { matches } of card?.texts ?? []) {
      expect(matches).toStrictEqual([]);
    }
  });

  it("matches a full name and bolds the span it matched", async () => {
    expect.hasAssertions();

    const page = await library({ search: "OVIDIUS" });

    expect(page.totalCount).toBe(1);
    expect(page.authors[0]?.author.name).toBe("Ovid");
    expect(page.authors[0]?.matches).toStrictEqual([
      { end: 15, field: "fullName", start: 8 },
    ]);
  });

  it("returns only the matching texts under an author the search did not match", async () => {
    expect.hasAssertions();

    const page = await library({ search: "aeneid" });
    const [card] = page.authors;

    expect(card?.author.name).toBe("Vergil");
    expect(card?.matches).toStrictEqual([]);
    expect(card?.textCount).toBe(1);
    expect(card?.texts).toHaveLength(1);
    expect(card?.texts[0]?.text).toMatchObject({
      collection: "PERSEUS",
      edition: "Oxford Classical Texts",
      title: "Aeneid",
    });
    expect(card?.texts[0]?.matches).toStrictEqual([
      { end: 6, field: "title", start: 0 },
    ]);
  });

  it("matches the collection a text was ingested from", async () => {
    expect.hasAssertions();

    const page = await library({ search: "csel" });
    const [card] = page.authors;

    expect(card?.author.name).toBe("Vergil");
    expect(card?.texts).toHaveLength(1);
    expect(card?.texts[0]?.text.edition).toBe("CSEL 12");
    expect(card?.texts[0]?.matches).toStrictEqual([
      { end: 4, field: "collection", start: 0 },
      { end: 4, field: "edition", start: 0 },
    ]);
  });

  it("matches the edition alone", async () => {
    expect.hasAssertions();

    const page = await library({ search: "oxford" });

    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Vergil",
    ]);
    expect(page.authors[0]?.texts.map(({ matches }) => matches)).toStrictEqual([
      [{ end: 6, field: "edition", start: 0 }],
    ]);
  });

  it("matches the find spot alone", async () => {
    expect.hasAssertions();

    const page = await library({ search: "pompeii" });

    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Ovid",
    ]);
    expect(page.authors[0]?.texts.map(({ text }) => text.title)).toStrictEqual([
      "Fasti",
    ]);
    expect(page.authors[0]?.texts[0]?.matches).toStrictEqual([
      { end: 7, field: "findSpot", start: 0 },
    ]);
  });

  it("mixes an author matched by name with an author matched by a text", async () => {
    expect.hasAssertions();

    const page = await library({ search: "publius" });
    const names = page.authors.map(({ author }) => author.name);
    const caesar = page.authors.find(({ author }) => author.name === "Caesar");
    const vergil = page.authors.find(({ author }) => author.name === "Vergil");

    expect(names).toStrictEqual(["Caesar", "Ovid", "Vergil"]);
    expect(caesar?.matches).toStrictEqual([]);
    expect(caesar?.texts.map(({ text }) => text.title)).toStrictEqual([
      "Publius Syrus Sententiae",
    ]);
    expect(vergil?.matches).toStrictEqual([
      { end: 7, field: "fullName", start: 0 },
    ]);
    expect(vergil?.texts).toHaveLength(4);
  });

  it("accepts a page size of exactly 100", async () => {
    expect.hasAssertions();

    const page = await library({ pageSize: 100 });

    expect(page.totalCount).toBe(5);
    expect(page.pageCount).toBe(1);
  });

  it("matches editors", async () => {
    expect.hasAssertions();

    const page = await library({ search: "mynors" });

    expect(page.authors[0]?.texts.map(({ text }) => text.title)).toStrictEqual([
      "Aeneid",
    ]);
    expect(page.authors[0]?.texts[0]?.matches).toStrictEqual([
      { end: 15, field: "editors", start: 9 },
    ]);
  });

  it("matches a Text inside a title for its author", async () => {
    expect.hasAssertions();

    const page = await library({ search: "gallico" });

    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Caesar",
    ]);
    expect(page.authors[0]?.texts[0]?.matches).toStrictEqual([
      { end: 16, field: "title", start: 9 },
    ]);
  });

  it("matches inscription attributes and carries inscriptions under their book", async () => {
    expect.hasAssertions();

    const page = await library({ search: "hispania" });
    const [card] = page.authors;

    expect(card?.author.name).toBe("Roman Inscriptions");
    expect(card?.textCount).toBe(LIBRARY_INSCRIPTION_COUNT);
    expect(card?.texts).toHaveLength(50);
    expect(card?.texts[0]?.text).toMatchObject({
      parentText: { title: "Tarraconensis" },
      title: "HD000001",
    });
    expect(card?.texts[0]?.matches).toStrictEqual([
      { end: 8, field: "province", start: 0 },
    ]);
  });

  it("matches the material and inscription type of an inscription", async () => {
    expect.hasAssertions();

    const material = await library({ search: "marble" });
    const type = await library({ search: "tombstone" });

    expect(material.authors[0]?.textCount).toBe(LIBRARY_INSCRIPTION_COUNT);
    expect(material.authors[0]?.texts[0]?.matches).toStrictEqual([
      { end: 6, field: "material", start: 0 },
    ]);
    expect(type.authors[0]?.texts[0]?.matches).toStrictEqual([
      { end: 9, field: "inscriptionType", start: 0 },
    ]);
  });

  it("leaves out a soft-deleted text", async () => {
    expect.hasAssertions();

    const page = await library({ search: "lost carmen" });

    expect(page.totalCount).toBe(0);
    expect(page.authors).toStrictEqual([]);
  });

  it("treats LIKE wildcards in the search as plain characters", async () => {
    expect.hasAssertions();

    const percent = await library({ search: "%" });
    const underscore = await library({ search: "_" });

    expect(percent.totalCount).toBe(0);
    expect(underscore.totalCount).toBe(0);
  });

  it("pages the authors and reports counts past the last page", async () => {
    expect.hasAssertions();

    const first = await library({ pageSize: 2 });
    const last = await library({ page: 3, pageSize: 2 });
    const past = await library({ page: 4, pageSize: 2 });

    expect(first.totalCount).toBe(5);
    expect(first.pageCount).toBe(3);
    expect(first.authors.map(({ author }) => author.name)).toStrictEqual([
      "Caesar",
      "Catullus",
    ]);
    expect(last.authors.map(({ author }) => author.name)).toStrictEqual([
      "Vergil",
    ]);
    expect(past).toMatchObject({ authors: [], pageCount: 3, totalCount: 5 });
  });

  it("returns no page when nothing matches", async () => {
    expect.hasAssertions();

    const page = await library({ search: "zzz-no-such-text" });

    expect(page).toMatchObject({ authors: [], pageCount: 0, totalCount: 0 });
  });

  it("rejects a page size above the limit", async () => {
    expect.hasAssertions();

    const body = await application.execute(LIBRARY, { pageSize: 101 });

    expect(body.errors).toHaveLength(1);
    expect(body.errors?.[0]?.message).toMatch(/101|less|<=|maximum/iu);
  });

  it("rejects a page below one", async () => {
    expect.hasAssertions();

    const body = await application.execute(LIBRARY, { page: 0 });

    expect(body.errors).toHaveLength(1);
  });

  it("filters authors by era", async () => {
    expect.hasAssertions();

    const page = await library({ filters: { eras: ["CLASSICAL"] } });

    expect(page.totalCount).toBe(3);
    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Caesar",
      "Catullus",
      "Vergil",
    ]);
  });

  it("keeps an author whose era is null out of any era filter", async () => {
    expect.hasAssertions();

    const page = await library({
      filters: { eras: ["CLASSICAL", "IMPERIAL", "MEDIEVAL"] },
    });

    expect(page.authors.map(({ author }) => author.name)).not.toContain(
      "Roman Inscriptions",
    );
  });

  it("treats an empty list of values as no filter", async () => {
    expect.hasAssertions();

    const page = await library({ filters: { eras: [] } });

    expect(page.totalCount).toBe(5);
  });

  it("filters authors by overlap with an inclusive BCE year range", async () => {
    expect.hasAssertions();

    const onBoundary = await library({
      filters: { authorYears: { max: -44, min: -44 } },
    });
    const single = await library({
      filters: { authorYears: { max: -43, min: -43 } },
    });
    const wide = await library({
      filters: { authorYears: { max: 1000, min: -1000 } },
    });

    expect(onBoundary.authors.map(({ author }) => author.name)).toStrictEqual([
      "Caesar",
      "Vergil",
    ]);
    expect(single.authors.map(({ author }) => author.name)).toStrictEqual([
      "Ovid",
      "Vergil",
    ]);
    expect(wide.authors.map(({ author }) => author.name)).not.toContain(
      "Roman Inscriptions",
    );
  });

  it("leaves out an author missing a start or end year from a range with one bound", async () => {
    expect.hasAssertions();

    const authors = application.database.repository(Author);
    const open = await authors.save(
      authors.create({ name: "Open Ended", slug: "open-ended", startYear: 0 }),
    );
    try {
      const minimum = await library({ filters: { authorYears: { min: 15 } } });
      const maximum = await library({
        filters: { authorYears: { max: -90 } },
      });

      expect(minimum.authors.map(({ author }) => author.name)).toStrictEqual([
        "Ovid",
      ]);
      expect(maximum.authors.map(({ author }) => author.name)).toStrictEqual([
        "Caesar",
      ]);
    } finally {
      await authors.delete(open.id);
    }
  });

  it("filters inscriptions by province, type, and material", async () => {
    expect.hasAssertions();

    const province = await library({
      filters: { provinces: ["Hispania Tarraconensis"] },
    });
    const type = await library({ filters: { inscriptionTypes: ["stela"] } });
    const material = await library({ filters: { materials: ["marble"] } });

    expect(province.authors.map(({ author }) => author.name)).toStrictEqual([
      "Roman Inscriptions",
    ]);
    expect(province.authors[0]?.textCount).toBe(LIBRARY_INSCRIPTION_COUNT);
    expect(type.totalCount).toBe(0);
    expect(material.authors[0]?.textCount).toBe(LIBRARY_INSCRIPTION_COUNT);
  });

  it("lists the distinct provinces, types, and materials with counts", async () => {
    expect.hasAssertions();

    const body = await application.execute(FACETS);

    expect(body.errors).toBeUndefined();
    expect(body.data).toStrictEqual({
      libraryFacets: {
        inscriptionTypes: [
          { count: 1, value: "altar" },
          { count: 1, value: "milestone" },
          { count: LIBRARY_INSCRIPTION_COUNT, value: "tombstone" },
        ],
        materials: [
          { count: 2, value: "limestone" },
          { count: LIBRARY_INSCRIPTION_COUNT, value: "marble" },
        ],
        provinces: [
          { count: 2, value: "Gallia Narbonensis" },
          { count: LIBRARY_INSCRIPTION_COUNT, value: "Hispania Tarraconensis" },
        ],
      },
    });
  });

  it("filters inscriptions by an inclusive year range that overlaps their dates", async () => {
    expect.hasAssertions();

    const inside = await library({
      filters: { inscriptionYears: { max: 160, min: 150 } },
    });
    const outside = await library({
      filters: { inscriptionYears: { max: 99, min: 0 } },
    });

    expect(inside.authors[0]?.textCount).toBe(LIBRARY_INSCRIPTION_COUNT);
    expect(inside.authors[0]?.texts[0]?.text.title).toBe("HD000001");
    expect(outside.totalCount).toBe(0);
  });

  it("filters texts by print year, line count, and word count", async () => {
    expect.hasAssertions();

    const printed = await library({
      filters: { printYears: { max: 1970, min: 1960 } },
    });
    const lines = await library({ filters: { lineCount: { max: 3, min: 3 } } });
    const words = await library({ filters: { wordCount: { min: 50 } } });

    expect(printed.authors.map(({ author }) => author.name)).toStrictEqual([
      "Vergil",
    ]);
    expect(
      printed.authors[0]?.texts.map(({ text }) => text.title),
    ).toStrictEqual(["Aeneid"]);
    expect(lines.authors[0]?.texts[0]?.text.title).toBe("Aeneid");
    expect(words).toMatchObject({ authors: [], totalCount: 0 });
  });

  it("combines filters with each other using AND", async () => {
    expect.hasAssertions();

    const page = await library({
      filters: { eras: ["CLASSICAL"], printYears: { max: 1970, min: 1960 } },
    });
    const [card] = page.authors;

    expect(page.totalCount).toBe(1);
    expect(card?.author.name).toBe("Vergil");
    expect(card?.textCount).toBe(1);
  });

  it("combines filters with search using AND", async () => {
    expect.hasAssertions();

    const printed = await library({
      filters: { printYears: { max: 1970, min: 1960 } },
      search: "vergil",
    });
    const none = await library({
      filters: { printYears: { max: 1970, min: 1960 } },
      search: "eclogues",
    });

    expect(
      printed.authors[0]?.texts.map(({ text }) => text.title),
    ).toStrictEqual(["Aeneid"]);
    expect(none.totalCount).toBe(0);
  });

  it("counts pages over the filtered authors", async () => {
    expect.hasAssertions();

    const page = await library({
      filters: { eras: ["CLASSICAL"] },
      pageSize: 2,
    });

    expect(page.totalCount).toBe(3);
    expect(page.pageCount).toBe(2);
  });

  it("sorts authors by an author attribute in both directions, with nulls last", async () => {
    expect.hasAssertions();

    const ascending = await library({
      sort: { direction: "ASC", field: "AUTHOR_START_YEAR" },
    });
    const descending = await library({
      sort: { direction: "DESC", field: "AUTHOR_START_YEAR" },
    });
    const byName = await library({
      sort: { direction: "DESC", field: "AUTHOR_NAME" },
    });

    expect(ascending.authors.map(({ author }) => author.name)).toStrictEqual([
      "Caesar",
      "Catullus",
      "Vergil",
      "Ovid",
      "Roman Inscriptions",
    ]);
    expect(descending.authors.map(({ author }) => author.name)).toStrictEqual([
      "Ovid",
      "Vergil",
      "Catullus",
      "Caesar",
      "Roman Inscriptions",
    ]);
    expect(byName.authors.map(({ author }) => author.name)).toStrictEqual([
      "Vergil",
      "Roman Inscriptions",
      "Ovid",
      "Catullus",
      "Caesar",
    ]);
  });

  it("sorts authors by era chronologically with nulls last", async () => {
    expect.hasAssertions();

    const page = await library({
      sort: { direction: "ASC", field: "AUTHOR_ERA" },
    });

    expect(page.authors.map(({ author }) => author.name)).toStrictEqual([
      "Caesar",
      "Catullus",
      "Vergil",
      "Ovid",
      "Roman Inscriptions",
    ]);
  });

  it("orders cards by their first matching text and orders texts within each card", async () => {
    expect.hasAssertions();

    const descending = await library({
      sort: { direction: "DESC", field: "TEXT_PRINT_YEAR" },
    });
    const ascending = await library({
      sort: { direction: "ASC", field: "TEXT_PRINT_YEAR" },
    });

    expect(descending.authors.map(({ author }) => author.name)).toStrictEqual([
      "Vergil",
      "Caesar",
      "Catullus",
      "Ovid",
      "Roman Inscriptions",
    ]);
    expect(
      descending.authors[0]?.texts.map(({ text }) => text.title),
    ).toStrictEqual(["Aeneid", "Book I", "Eclogues", "Eclogues"]);
    expect(ascending.authors[0]?.author.name).toBe("Vergil");
  });

  it("sorts texts by a text attribute in both directions", async () => {
    expect.hasAssertions();

    const descending = await library({
      search: "vergil",
      sort: { direction: "DESC", field: "TEXT_TITLE" },
    });
    const ascending = await library({
      sort: { direction: "ASC", field: "TEXT_TITLE" },
    });
    const descendingAuthors = await library({
      sort: { direction: "DESC", field: "TEXT_TITLE" },
    });

    expect(
      descending.authors[0]?.texts.map(({ text }) => text.title),
    ).toStrictEqual(["Eclogues", "Eclogues", "Book I", "Aeneid"]);
    expect(ascending.authors.map(({ author }) => author.name)).toStrictEqual([
      "Vergil",
      "Catullus",
      "Caesar",
      "Ovid",
      "Roman Inscriptions",
    ]);
    expect(
      descendingAuthors.authors.map(({ author }) => author.name),
    ).toStrictEqual([
      "Roman Inscriptions",
      "Caesar",
      "Ovid",
      "Vergil",
      "Catullus",
    ]);
  });

  it("rejects an unknown enum value", async () => {
    expect.hasAssertions();

    const body = await application.execute(LIBRARY, {
      filters: { eras: ["MODERN"] },
    });

    expect(body.errors).toHaveLength(1);
  });

  it("rejects an inverted range", async () => {
    expect.hasAssertions();

    const body = await application.execute(LIBRARY, {
      filters: { printYears: { max: 1960, min: 1970 } },
    });

    expect(body.errors).toHaveLength(1);
    expect(body.errors?.[0]?.message).toMatch(/min|max|range/iu);
  });
});
