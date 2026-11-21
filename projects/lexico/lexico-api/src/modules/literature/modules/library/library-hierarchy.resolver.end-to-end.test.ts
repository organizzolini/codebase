/* cspell:words Fasti Heroides Tarraconensis Narbonensis */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Text } from "@codebase/lexico-db";

import { DATABASE_TIMEOUT_MILLISECONDS } from "../../../../../testing/database";
import {
  type LibraryApplication,
  startLibraryApplication,
} from "../../../../../testing/library-application";
import {
  LIBRARY_FASTI_BOOK_COUNT,
  LIBRARY_INSCRIPTION_COUNT,
} from "../../../../../testing/library-catalog";

/** A page of Texts as `libraryChildren` and `libraryWorks` select one. */
interface TextsPageNode {
  readonly pageCount: number;
  readonly texts: {
    readonly childCount: number;
    readonly matches: { readonly field: string }[];
    readonly text: { readonly id: string; readonly title: string };
  }[];
  readonly totalCount: number;
}

/** Pages the children of a Text. */
const CHILDREN = `
  query Children($parentTextId: ID!, $search: String, $page: Int, $pageSize: Int) {
    libraryChildren(parentTextId: $parentTextId, search: $search, page: $page, pageSize: $pageSize) {
      pageCount
      totalCount
      texts { childCount matches { field } text { id title } }
    }
  }
`;

/** Pages the top-level works of an author. */
const WORKS = `
  query Works($authorId: ID!, $search: String, $page: Int, $pageSize: Int) {
    libraryWorks(authorId: $authorId, search: $search, page: $page, pageSize: $pageSize) {
      pageCount
      totalCount
      texts { childCount text { id title } }
    }
  }
`;

/**
 * Executes the hierarchy queries over HTTP against the whole Lexico API and
 * a real database seeded with the library catalog.
 */
describe("library hierarchy resolver end-to-end suite", () => {
  let application: LibraryApplication;

  /** Runs a query, expecting success, and returns the page it names. */
  async function page(
    document: string,
    name: "libraryChildren" | "libraryWorks",
    variables: Record<string, unknown>,
  ): Promise<TextsPageNode> {
    const body = await application.execute(document, variables);

    expect(body.errors).toBeUndefined();

    const found = (body.data as Record<string, TextsPageNode | undefined>)[
      name
    ];
    if (found === undefined) {
      throw new Error(`GraphQL returned no ${name}`);
    }
    return found;
  }

  /** The id of the author of the Text with a title. */
  async function authorIdOf(title: string): Promise<string> {
    const text = await application.database
      .repository(Text)
      .findOneByOrFail({ title });
    return text.author.id;
  }

  /** The id of the Text with a title. */
  async function idOf(title: string): Promise<string> {
    const text = await application.database
      .repository(Text)
      .findOneByOrFail({ title });
    return text.id;
  }

  beforeAll(async () => {
    application = await startLibraryApplication();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("orders numbered children by their number, not alphabetically", async () => {
    expect.hasAssertions();

    const children = await page(CHILDREN, "libraryChildren", {
      parentTextId: await idOf("Fasti"),
    });

    expect(children.totalCount).toBe(LIBRARY_FASTI_BOOK_COUNT);
    expect(children.texts.map(({ text }) => text.title)).toStrictEqual(
      Array.from(
        { length: LIBRARY_FASTI_BOOK_COUNT },
        (_, index) => `Book ${String(index + 1)}`,
      ),
    );
  });

  it("pages the children and counts the pages", async () => {
    expect.hasAssertions();

    const second = await page(CHILDREN, "libraryChildren", {
      page: 2,
      pageSize: 5,
      parentTextId: await idOf("Fasti"),
    });

    expect(second.pageCount).toBe(3);
    expect(second.texts.map(({ text }) => text.title)).toStrictEqual([
      "Book 6",
      "Book 7",
      "Book 8",
      "Book 9",
      "Book 10",
    ]);
  });

  it("marks matches in children without narrowing them", async () => {
    expect.hasAssertions();

    const children = await page(CHILDREN, "libraryChildren", {
      parentTextId: await idOf("Tarraconensis"),
      search: "HD000007",
    });

    expect(children.totalCount).toBe(LIBRARY_INSCRIPTION_COUNT + 2);

    const matched = children.texts.filter(({ matches }) => matches.length > 0);

    expect(matched.map(({ text }) => text.title)).toStrictEqual(["HD000007"]);
  });

  it("reports the child count of a child that holds more", async () => {
    expect.hasAssertions();

    const children = await page(CHILDREN, "libraryChildren", {
      parentTextId: await idOf("Aeneid"),
    });

    expect(children.texts).toHaveLength(1);
    expect(children.texts[0]?.childCount).toBe(0);
  });

  it("returns no children for a Text that has none", async () => {
    expect.hasAssertions();

    const children = await page(CHILDREN, "libraryChildren", {
      parentTextId: await idOf("Heroides"),
    });

    expect(children).toStrictEqual({ pageCount: 0, texts: [], totalCount: 0 });
  });

  it("rejects a children page size above the limit", async () => {
    expect.hasAssertions();

    const body = await application.execute(CHILDREN, {
      pageSize: 101,
      parentTextId: await idOf("Fasti"),
    });

    expect(body.errors?.[0]?.extensions).toMatchObject({
      code: "BAD_USER_INPUT",
    });
  });

  it("pages an author's top-level works in scope", async () => {
    expect.hasAssertions();

    const author = await authorIdOf("Fasti");
    const first = await page(WORKS, "libraryWorks", {
      authorId: author,
      page: 1,
      pageSize: 1,
    });
    const second = await page(WORKS, "libraryWorks", {
      authorId: author,
      page: 2,
      pageSize: 1,
    });

    expect(first.totalCount).toBe(2);
    expect(first.pageCount).toBe(2);
    expect(first.texts.map(({ text }) => text.title)).toStrictEqual(["Fasti"]);
    expect(first.texts[0]?.childCount).toBe(LIBRARY_FASTI_BOOK_COUNT);
    expect(second.texts.map(({ text }) => text.title)).toStrictEqual([
      "Heroides",
    ]);
  });

  it("keeps a work that holds a matching child, and no other", async () => {
    expect.hasAssertions();

    const author = await authorIdOf("Fasti");
    const works = await page(WORKS, "libraryWorks", {
      authorId: author,
      search: "book 12",
    });

    expect(works.texts.map(({ text }) => text.title)).toStrictEqual(["Fasti"]);
  });

  it("pages no works for an author that holds none", async () => {
    expect.hasAssertions();

    const works = await page(WORKS, "libraryWorks", {
      authorId: "00000000-0000-0000-0000-000000000000",
    });

    expect(works).toStrictEqual({ pageCount: 0, texts: [], totalCount: 0 });
  });
});
