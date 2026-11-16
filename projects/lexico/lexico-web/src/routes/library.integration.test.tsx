// cspell:ignore Eclogues Maro Metamorphoses Mynors Hirtel
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { graphqlMockServer } from "@codebase/interface/testing";
import { renderRoute } from "@codebase/testing/react";

import {
  AuthorEra,
  LibrarySortDirection,
  LibrarySortField,
  mockLibraryQuery,
  TextCollection,
} from "../graphql/generated/mocks";
import { getRouter } from "../router";

import { Route } from "./library";

import type { LibraryPageResult } from "../components/library-grid/library-grid.types";
import type { LibraryQueryVariables } from "../graphql/generated/mocks";

type LibraryAuthorRow = LibraryPageResult["authors"][number];
type LibraryTextRow = LibraryAuthorRow["texts"][number];

const SEARCHES: { page: number; search: string }[] = [];
const CALLS: LibraryQueryVariables[] = [];

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
function answer(
  search: string,
  variables: LibraryQueryVariables = {},
): LibraryPageResult {
  if (
    search === "zzz" ||
    variables.filters?.eras?.includes(AuthorEra.NeoLatin)
  ) {
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
    CALLS.length = 0;
    graphqlMockServer.use(
      mockLibraryQuery(({ variables }) => {
        const page = variables.page ?? 1;
        const search = variables.search ?? "";
        SEARCHES.push({ page, search });
        CALLS.push(variables);
        return HttpResponse.json({
          data: { library: answer(search, variables) },
        });
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

  it("sends a ticked filter to the API and the URL", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    fireEvent.click(await screen.findByRole("checkbox", { name: "Classical" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() =>
      expect(CALLS.at(-1)?.filters?.eras).toStrictEqual([AuthorEra.Classical]),
    );

    expect(router.state.location.search.eras).toStrictEqual([
      AuthorEra.Classical,
    ]);
  });

  it("sends typed lists and ranges to the API and the URL", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    fireEvent.change(await screen.findByLabelText("Provinces"), {
      target: { value: "Dacia, Syria" },
    });
    fireEvent.change(
      screen.getByLabelText("Author years (negative for BCE) minimum"),
      {
        target: { value: "-70" },
      },
    );
    fireEvent.change(screen.getByLabelText("Line count maximum"), {
      target: { value: "900" },
    });
    fireEvent.submit(screen.getByRole("form", { name: "Library filters" }));

    await waitFor(() =>
      expect(CALLS.at(-1)?.filters).toMatchObject({
        authorYears: { max: null, min: -70 },
        lineCount: { max: 900, min: null },
        provinces: ["Dacia", "Syria"],
      }),
    );

    expect({ ...router.state.location.search }).toMatchObject({
      authorYearsMinimum: -70,
      lineCountMaximum: 900,
      provinces: ["Dacia", "Syria"],
    });
  });

  it("sends a chosen sort and direction to the API and the URL", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    fireEvent.change(await screen.findByLabelText("Sort by"), {
      target: { value: LibrarySortField.TextLineCount },
    });
    await waitFor(() =>
      expect(
        screen.getByLabelText<HTMLSelectElement>("Direction").disabled,
      ).toBe(false),
    );
    fireEvent.change(screen.getByLabelText("Direction"), {
      target: { value: LibrarySortDirection.Desc },
    });

    await waitFor(() =>
      expect(CALLS.at(-1)?.sort).toStrictEqual({
        direction: LibrarySortDirection.Desc,
        field: LibrarySortField.TextLineCount,
      }),
    );

    expect({ ...router.state.location.search }).toStrictEqual({
      direction: LibrarySortDirection.Desc,
      sort: LibrarySortField.TextLineCount,
    });
  });

  it("restores every control from the URL", async () => {
    const url =
      "/library?search=vergil&eras=%5B%22CLASSICAL%22%5D&provinces=%5B%22Dacia%22%5D&wordCountMinimum=100&sort=AUTHOR_NAME&direction=DESC";
    await renderRoute(getRouter(), url);

    await screen.findByText("50 authors");

    expect(
      screen.getByRole<HTMLInputElement>("checkbox", { name: "Classical" })
        .checked,
    ).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>("Provinces").value).toBe(
      "Dacia",
    );
    expect(
      screen.getByLabelText<HTMLInputElement>("Word count minimum").value,
    ).toBe("100");
    expect(screen.getByLabelText<HTMLSelectElement>("Sort by").value).toBe(
      LibrarySortField.AuthorName,
    );
    expect(screen.getByLabelText<HTMLSelectElement>("Direction").value).toBe(
      LibrarySortDirection.Desc,
    );
    expect(CALLS.at(-1)).toMatchObject({
      filters: { eras: [AuthorEra.Classical], provinces: ["Dacia"] },
      search: "vergil",
      sort: {
        direction: LibrarySortDirection.Desc,
        field: LibrarySortField.AuthorName,
      },
    });
  });

  it("returns to the earlier results with the back button", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    fireEvent.click(await screen.findByRole("checkbox", { name: "Late" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() =>
      expect(CALLS.at(-1)?.filters?.eras).toStrictEqual([AuthorEra.Late]),
    );

    router.history.back();

    await waitFor(() => expect(CALLS.at(-1)?.filters?.eras).toBeNull());
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLInputElement>("checkbox", { name: "Late" })
          .checked,
      ).toBe(false),
    );
  });

  it("returns to the first page when a filter changes", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?page=2");

    fireEvent.click(await screen.findByRole("checkbox", { name: "Late" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() => expect(SEARCHES.at(-1)?.page).toBe(1));

    expect(router.state.location.search.page).toBeUndefined();
  });

  it("returns to the first page when the sort changes", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?page=2");

    fireEvent.change(await screen.findByLabelText("Sort by"), {
      target: { value: LibrarySortField.AuthorName },
    });

    await waitFor(() => expect(SEARCHES.at(-1)?.page).toBe(1));

    expect(router.state.location.search.page).toBeUndefined();
  });

  it("keeps the filters and sort when a new search is submitted", async () => {
    const router = getRouter();
    await renderRoute(
      router,
      "/library?eras=%5B%22CLASSICAL%22%5D&sort=AUTHOR_NAME",
    );

    fireEvent.change(await screen.findByRole("searchbox"), {
      target: { value: "ecl" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => expect(CALLS.at(-1)?.search).toBe("ecl"));

    expect(CALLS.at(-1)?.filters?.eras).toStrictEqual([AuthorEra.Classical]);
    expect(CALLS.at(-1)?.sort?.field).toBe(LibrarySortField.AuthorName);
  });

  it("drops invalid filter and sort values to their defaults", async () => {
    await renderRoute(
      getRouter(),
      "/library?eras=%5B%22NOPE%22%5D&collections=PERSEUS&sort=BOGUS&direction=UP&lineCountMinimum=abc&provinces=%5B%5D",
    );

    await screen.findByText("50 authors");

    expect(CALLS.at(-1)?.sort).toBeNull();
    expect(CALLS.at(-1)?.filters).toStrictEqual({
      authorYears: null,
      collections: null,
      eras: null,
      inscriptionTypes: null,
      inscriptionYears: null,
      kinds: null,
      lineCount: null,
      materials: null,
      printYears: null,
      provinces: null,
      wordCount: null,
    });
  });

  it("shows a no-results state that resets the filters but keeps the search", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?search=ecl&eras=%5B%22NEO_LATIN%22%5D");

    await expect(
      screen.findByText("No authors match ecl"),
    ).resolves.toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Reset all filters" }));

    await waitFor(() => expect(CALLS.at(-1)?.filters?.eras).toBeNull());

    expect(CALLS.at(-1)?.search).toBe("ecl");
    expect({ ...router.state.location.search }).toMatchObject({
      search: "ecl",
    });
    expect(router.state.location.search.eras).toBeUndefined();
  });

  it("names the filters in the no-results state when there is no search", async () => {
    await renderRoute(getRouter(), "/library?eras=%5B%22NEO_LATIN%22%5D");

    await expect(
      screen.findByText("No authors match these filters"),
    ).resolves.toBeDefined();
  });

  it("opens its filters from a button for a phone", async () => {
    await renderRoute(getRouter(), "/library");

    const toggle = await screen.findByRole("button", { name: "Filters" });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBe("library-filter-panel");
  });

  it("reaches every control with the keyboard", async () => {
    await renderRoute(getRouter(), "/library");

    const controls = [
      await screen.findByRole("checkbox", { name: "Classical" }),
      screen.getByLabelText("Provinces"),
      screen.getByLabelText("Line count minimum"),
      screen.getByRole("button", { name: "Apply filters" }),
      screen.getByLabelText("Sort by"),
    ];

    for (const control of controls) {
      control.focus();

      expect(document.activeElement).toBe(control);
    }
  });
});
