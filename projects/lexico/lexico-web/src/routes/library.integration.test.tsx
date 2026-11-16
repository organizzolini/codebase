// cspell:ignore Eclogues Maro Metamorphoses Mynors Hirtel
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { graphqlMockServer } from "@codebase/interface/testing";
import { renderRoute } from "@codebase/testing/react";

import {
  AuthorEra,
  mockLibraryQuery,
  TextCollection,
} from "../graphql/generated/mocks";
import { getRouter } from "../router";

import { Route } from "./library";

import type { LibraryPageResult } from "../components/library-grid/library-grid.types";

type LibraryAuthorRow = LibraryPageResult["authors"][number];
type LibraryTextRow = LibraryAuthorRow["texts"][number];

const SEARCHES: { page: number; search: string }[] = [];

const PARENT = {
  id: "text-aeneid",
  slug: "vergil-aeneid",
  title: "Aeneid",
};

const AENEID_BOOK_ONE: LibraryTextRow = {
  matches: [],
  text: {
    collection: TextCollection.Perseus,
    edition: "Mynors 1969",
    id: "text-aeneid-1",
    lineCount: 756,
    parentText: PARENT,
    slug: "vergil-aeneid-1",
    title: "Book 1",
    type: "text",
    wordCount: 9902,
  },
};

const AENEID_BOOK_ONE_CSEL: LibraryTextRow = {
  matches: [],
  text: {
    collection: TextCollection.Csel,
    edition: "Hirtel 1891",
    id: "text-aeneid-1-csel",
    lineCount: 756,
    parentText: PARENT,
    slug: "vergil-aeneid-1-csel",
    title: "Book 1",
    type: "text",
    wordCount: 9800,
  },
};

const ECLOGUES: LibraryTextRow = {
  matches: [{ end: 3, field: "title", start: 0 }],
  text: {
    collection: TextCollection.TheLatinLibrary,
    edition: null,
    id: "text-eclogues",
    lineCount: 830,
    parentText: null,
    slug: "vergil-eclogues",
    title: "Eclogues",
    type: "text",
    wordCount: 2000,
  },
};

const AENEID_BOOK: LibraryTextRow = {
  matches: [],
  text: {
    collection: TextCollection.Perseus,
    edition: "Mynors 1969",
    id: PARENT.id,
    lineCount: null,
    parentText: null,
    slug: PARENT.slug,
    title: PARENT.title,
    type: "book",
    wordCount: null,
  },
};

const VERGIL: LibraryAuthorRow = {
  author: {
    endYear: 19,
    era: AuthorEra.Classical,
    fullName: "Publius Vergilius Maro",
    id: "author-vergil",
    name: "Vergil",
    slug: "vergil",
    startYear: -70,
  },
  matches: [],
  textCount: 4,
  texts: [AENEID_BOOK, AENEID_BOOK_ONE, AENEID_BOOK_ONE_CSEL, ECLOGUES],
};

const OVID: LibraryAuthorRow = {
  author: {
    endYear: 17,
    era: AuthorEra.Imperial,
    fullName: null,
    id: "author-ovid",
    name: "Ovid",
    slug: "ovid",
    startYear: -43,
  },
  matches: [],
  textCount: 60,
  texts: [
    {
      matches: [],
      text: {
        collection: TextCollection.Perseus,
        edition: null,
        id: "text-metamorphoses",
        lineCount: null,
        parentText: null,
        slug: "ovid-metamorphoses",
        title: "Metamorphoses",
        type: "text",
        wordCount: null,
      },
    },
  ],
};

/** The page the API answers for one search, with a fixed page count. */
function answer(search: string): LibraryPageResult {
  if (search === "zzz") {
    return { authors: [], pageCount: 0, totalCount: 0 };
  }

  if (search === "ecl") {
    return {
      authors: [{ ...VERGIL, matches: [], textCount: 1, texts: [ECLOGUES] }],
      pageCount: 1,
      totalCount: 1,
    };
  }

  return { authors: [VERGIL, OVID], pageCount: 3, totalCount: 50 };
}

describe("library", () => {
  beforeEach(() => {
    SEARCHES.length = 0;
    graphqlMockServer.use(
      mockLibraryQuery(({ variables }) => {
        const page = variables.page ?? 1;
        const search = variables.search ?? "";
        SEARCHES.push({ page, search });
        return HttpResponse.json({ data: { library: answer(search) } });
      }),
    );
  });

  afterEach(() => {
    globalThis.localStorage.clear();
  });

  it("renders its page", async () => {
    await renderRoute(getRouter(), "/library");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/library");
  });

  it("shows Author cards with era, years, texts, and collections", async () => {
    await renderRoute(getRouter(), "/library");

    await expect(
      screen.findByRole("heading", { level: 1, name: "Library" }),
    ).resolves.toBeDefined();

    const card = await screen.findByRole("button", { name: /Vergil/u });

    expect(within(card).getByText("Classical")).toBeDefined();
    expect(within(card).getByText("70 BCE–19 CE")).toBeDefined();
    expect(within(card).getByText("4 texts")).toBeDefined();
    expect(within(card).getByText(/Perseus/u)).toBeDefined();
    expect(within(card).getByText(/CSEL/u)).toBeDefined();
  });

  it("shows the total count with numbered pages", async () => {
    await renderRoute(getRouter(), "/library");

    await expect(screen.findByText("50 authors")).resolves.toBeDefined();

    const pages = screen.getByRole("navigation", { name: "Library pages" });

    expect(within(pages).getByRole("button", { name: "2" })).toBeDefined();
    expect(within(pages).getByRole("button", { name: "3" })).toBeDefined();
  });

  it("expands a card into its books and Texts, labelling duplicate editions", async () => {
    await renderRoute(getRouter(), "/library");

    const toggle = await screen.findByRole("button", { name: /Vergil/u });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByRole("heading", { level: 3, name: "Aeneid" }),
    ).toBeDefined();

    const books = screen.getAllByRole("link", { name: /Book 1/u });

    expect(books).toHaveLength(2);
    expect(books[0]?.getAttribute("href")).toBe("/texts/vergil-aeneid-1");
    expect(books[1]?.getAttribute("href")).toBe("/texts/vergil-aeneid-1-csel");
    expect(screen.getByText("Perseus · Mynors 1969")).toBeDefined();
    expect(screen.getByText("CSEL · Hirtel 1891")).toBeDefined();
  });

  it("says how many Texts a card omits when it holds more than it returns", async () => {
    await renderRoute(getRouter(), "/library");

    fireEvent.click(await screen.findByRole("button", { name: /Ovid/u }));

    expect(screen.getByText("Showing 1 of 60 texts")).toBeDefined();
  });

  it("sends a submitted search to the API and the URL", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    const box = await screen.findByRole("searchbox", {
      name: "Search the library",
    });
    fireEvent.change(box, { target: { value: "ecl" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(SEARCHES.at(-1)).toStrictEqual({ page: 1, search: "ecl" }),
    );

    expect({ ...router.state.location.search }).toStrictEqual({
      search: "ecl",
    });
  });

  it("bolds only the matched part of a Text title from the API's ranges", async () => {
    await renderRoute(getRouter(), "/library?search=ecl");

    await expect(
      screen.findByText("Ecl", { selector: "strong" }),
    ).resolves.toBeDefined();
    expect(screen.getByRole("link", { name: /Eclogues/u })).toBeDefined();
  });

  it("opens a searched card with its matching Texts already shown", async () => {
    await renderRoute(getRouter(), "/library?search=ecl");

    const toggle = await screen.findByRole("button", { name: /Vergil/u });

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("reads the search and page from the URL", async () => {
    await renderRoute(getRouter(), "/library?search=vergil&page=2");

    const box = await screen.findByRole("searchbox", {
      name: "Search the library",
    });

    expect((box as HTMLInputElement).value).toBe("vergil");
    expect(SEARCHES.at(-1)).toStrictEqual({ page: 2, search: "vergil" });
  });

  it("drops invalid URL values to their defaults", async () => {
    await renderRoute(getRouter(), "/library?page=abc");

    await screen.findByText("50 authors");

    expect(SEARCHES.at(-1)).toStrictEqual({ page: 1, search: "" });
  });

  it("drops a page below one to the first page", async () => {
    await renderRoute(getRouter(), "/library?page=-3");

    await screen.findByText("50 authors");

    expect(SEARCHES.at(-1)).toStrictEqual({ page: 1, search: "" });
  });

  it("moves to another page, keeps it in the URL, and returns with back", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    const pages = await screen.findByRole("navigation", {
      name: "Library pages",
    });
    fireEvent.click(within(pages).getByRole("button", { name: "2" }));

    await waitFor(() => expect(SEARCHES.at(-1)?.page).toBe(2));

    expect({ ...router.state.location.search }).toStrictEqual({ page: 2 });

    router.history.back();

    await waitFor(() => expect(SEARCHES.at(-1)?.page).toBe(1));
  });

  it("shows a no-results state that clears the search", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?search=zzz");

    await expect(
      screen.findByText("No authors match zzz"),
    ).resolves.toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    await waitFor(() =>
      expect(SEARCHES.at(-1)).toStrictEqual({ page: 1, search: "" }),
    );

    expect({ ...router.state.location.search }).toStrictEqual({});
  });

  it("names the search in its page title and description", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?search=ecl");

    await screen.findByRole("heading", { level: 1, name: "Library" });
    const meta = router.state.matches.flatMap((match) => match.meta ?? []);

    expect(meta).toContainEqual({ title: "Lexico - Library: ecl" });
    expect(meta).toContainEqual(
      expect.objectContaining({ name: "description" }),
    );
  });

  it("titles the page plainly without a search", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    await screen.findByRole("heading", { level: 1, name: "Library" });
    const meta = router.state.matches.flatMap((match) => match.meta ?? []);

    expect(meta).toContainEqual({ title: "Lexico - Library" });
  });
});
