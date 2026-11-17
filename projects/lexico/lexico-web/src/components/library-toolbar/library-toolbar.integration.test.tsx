import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { graphqlMockServer } from "@codebase/interface/testing";
import { renderRoute } from "@codebase/testing/react";

import {
  AuthorEra,
  LibrarySortDirection,
  LibrarySortField,
  mockLibraryFacetsQuery,
  mockLibraryQuery,
} from "../../graphql/generated/mocks";
import { getRouter } from "../../router";
import { LIBRARY_SORT_OPTIONS } from "../library-sort/library-sort.constants";

import type { LibraryQueryVariables } from "../../graphql/generated/mocks";

const CALLS: LibraryQueryVariables[] = [];

/** Opens the Filter menu and picks one attribute, leaving its condition menu open. */
async function pickAttribute(attribute: string): Promise<void> {
  fireEvent.click(await screen.findByRole("button", { name: /^Filter/u }));
  fireEvent.click(await screen.findByRole("option", { name: attribute }));
  await settle();
}

/** Picks the condition of the chip whose menu is open. */
async function pickCondition(condition: string): Promise<void> {
  fireEvent.click(await screen.findByRole("option", { name: condition }));
  await settle();
}

/** Lets a menu or popover finish opening before the next step. */
async function settle(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 50);
  });
}

describe("library toolbar", () => {
  beforeEach(() => {
    CALLS.length = 0;
    graphqlMockServer.use(
      mockLibraryFacetsQuery(() =>
        HttpResponse.json({
          data: {
            libraryFacets: {
              inscriptionTypes: [{ count: 2, value: "epitaph" }],
              materials: [{ count: 1, value: "marble" }],
              provinces: [
                { count: 12, value: "Dacia" },
                { count: 1, value: "Syria" },
              ],
            },
          },
        }),
      ),
      mockLibraryQuery(({ variables }) => {
        CALLS.push(variables);
        const isEmpty = variables.filters?.eras?.includes(AuthorEra.NeoLatin);

        return HttpResponse.json({
          data: {
            library: {
              authors: [],
              pageCount: isEmpty === true ? 0 : 3,
              totalCount: isEmpty === true ? 0 : 50,
            },
          },
        });
      }),
    );
  });

  it("puts the search box, Filter, and Sort on one row", async () => {
    await renderRoute(getRouter(), "/library");

    const toolbar = await screen.findByTestId("library-toolbar");
    const row = toolbar.firstElementChild as HTMLElement;

    expect(
      within(row).getByRole("searchbox", { name: "Search the library" }),
    ).toBeDefined();
    expect(within(row).getByRole("button", { name: "Search" })).toBeDefined();
    expect(within(row).getByRole("button", { name: "Filter" })).toBeDefined();
    expect(within(row).getByRole("button", { name: "Sort" })).toBeDefined();
  });

  it("offers every filter attribute in the Filter menu", async () => {
    await renderRoute(getRouter(), "/library");

    fireEvent.click(await screen.findByRole("button", { name: "Filter" }));

    const options = await screen.findAllByRole("option");

    expect(options.map((option) => option.textContent)).toStrictEqual([
      "Era",
      "Author years",
      "Inscription province",
      "Inscription type",
      "Material",
      "Inscription years",
      "Print year",
      "Line count",
      "Word count",
    ]);
  });

  it("adds an era chip from the menu and sends it at once", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    await pickAttribute("Era");
    await pickCondition("is any of");
    fireEvent.click(await screen.findByRole("option", { name: "Classical" }));

    await waitFor(() =>
      expect(CALLS.at(-1)?.filters?.eras).toStrictEqual([AuthorEra.Classical]),
    );

    expect(router.state.location.search.eras).toStrictEqual([
      AuthorEra.Classical,
    ]);
    expect(
      screen.getByRole("group", { name: /Era is any of Classical/u }),
    ).toBeDefined();
  });

  it("offers the facet values with their counts", async () => {
    await renderRoute(getRouter(), "/library");

    await pickAttribute("Inscription province");
    await pickCondition("is any of");

    await expect(screen.findByText("12 texts")).resolves.toBeDefined();
    expect(screen.getByText("1 text")).toBeDefined();

    fireEvent.click(screen.getByRole("option", { name: /Dacia/u }));

    await waitFor(() =>
      expect(CALLS.at(-1)?.filters?.provinces).toStrictEqual(["Dacia"]),
    );
  });

  it.each([
    ["Inscription type", "epitaph", "inscriptionTypes"],
    ["Material", "marble", "materials"],
  ] as const)("filters by %s from its facet", async (attribute, value, key) => {
    await renderRoute(getRouter(), "/library");

    await pickAttribute(attribute);
    await pickCondition("is any of");
    fireEvent.click(
      await screen.findByRole("option", { name: new RegExp(value, "u") }),
    );

    await waitFor(() =>
      expect(CALLS.at(-1)?.filters?.[key]).toStrictEqual([value]),
    );
  });

  it.each([
    ["Author years", "authorYears"],
    ["Inscription years", "inscriptionYears"],
    ["Print year", "printYears"],
    ["Line count", "lineCount"],
    ["Word count", "wordCount"],
  ] as const)("filters by a %s range", async (attribute, key) => {
    const router = getRouter();
    await renderRoute(router, "/library");

    await pickAttribute(attribute);
    await pickCondition("is between");
    fireEvent.change(await screen.findByLabelText(`${attribute} from`), {
      target: { value: "-70" },
    });
    fireEvent.change(screen.getByLabelText(`${attribute} to`), {
      target: { value: "19" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(CALLS.at(-1)?.filters?.[key]).toStrictEqual({ max: 19, min: -70 }),
    );

    expect({ ...router.state.location.search }).toMatchObject({
      [`${key}Maximum`]: 19,
      [`${key}Minimum`]: -70,
    });
  });

  it("keeps a filter chip off the URL until it has a value", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    await pickAttribute("Era");

    expect(
      screen.getByRole("group", { name: /Era .*incomplete/u }),
    ).toBeDefined();
    expect({ ...router.state.location.search }).toStrictEqual({});
  });

  it("removes a filter chip and clears it from the URL", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?eras=%5B%22CLASSICAL%22%5D");

    fireEvent.click(
      await screen.findByRole("button", { name: "Era filter options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: /Remove/u }));

    await waitFor(() => expect(CALLS.at(-1)?.filters?.eras).toBeNull());

    expect(router.state.location.search.eras).toBeUndefined();
    expect(screen.queryByRole("group", { name: /Era is any of/u })).toBeNull();
  });

  it("restores every chip from the URL", async () => {
    const url =
      "/library?search=vergil&eras=%5B%22CLASSICAL%22%5D&provinces=%5B%22Dacia%22%5D&wordCountMinimum=100&sort=AUTHOR_NAME&direction=DESC";
    await renderRoute(getRouter(), url);

    await screen.findByText("50 authors");

    expect(
      screen.getByRole("group", { name: /Era is any of Classical/u }),
    ).toBeDefined();
    expect(
      screen.getByRole("group", {
        name: /Inscription province is any of Dacia/u,
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("group", { name: /Word count is between/u }),
    ).toBeDefined();
    expect(
      screen.getByRole("group", { name: "Sort by Author name, descending" }),
    ).toBeDefined();
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

    await pickAttribute("Era");
    await pickCondition("is any of");
    fireEvent.click(await screen.findByRole("option", { name: "Late" }));
    await waitFor(() =>
      expect(CALLS.at(-1)?.filters?.eras).toStrictEqual([AuthorEra.Late]),
    );

    router.history.back();

    await waitFor(() => expect(CALLS.at(-1)?.filters?.eras).toBeNull());
    await waitFor(() =>
      expect(
        screen.queryByRole("group", { name: /Era is any of/u }),
      ).toBeNull(),
    );
  });

  it("returns to the first page when a filter changes", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?page=2");

    await pickAttribute("Era");
    await pickCondition("is any of");
    fireEvent.click(await screen.findByRole("option", { name: "Late" }));

    await waitFor(() => expect(CALLS.at(-1)?.page).toBe(1));

    expect(router.state.location.search.page).toBeUndefined();
  });

  it("keeps a half-made chip when a new search is submitted", async () => {
    await renderRoute(getRouter(), "/library");

    await pickAttribute("Era");
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "vergil" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => expect(CALLS.at(-1)?.search).toBe("vergil"));

    expect(
      screen.getByRole("group", { name: /Era .*incomplete/u }),
    ).toBeDefined();
  });

  it("lists every sort attribute in the Sort menu", async () => {
    await renderRoute(getRouter(), "/library");

    fireEvent.click(await screen.findByRole("button", { name: "Sort" }));

    const items = await screen.findAllByRole("menuitemradio");

    expect(items.map((item) => item.textContent)).toStrictEqual(
      LIBRARY_SORT_OPTIONS.map(({ label }) => label),
    );
    expect(
      new Set(LIBRARY_SORT_OPTIONS.map(({ field }) => field)),
    ).toStrictEqual(new Set(Object.values(LibrarySortField)));
  });

  it("adds an ascending sort chip, flips it, and removes it", async () => {
    const router = getRouter();
    await renderRoute(router, "/library");

    fireEvent.click(await screen.findByRole("button", { name: "Sort" }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Text line count" }),
    );

    await waitFor(() =>
      expect(CALLS.at(-1)?.sort).toStrictEqual({
        direction: LibrarySortDirection.Asc,
        field: LibrarySortField.TextLineCount,
      }),
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Switch to descending/u }),
    );

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

    fireEvent.click(screen.getByRole("button", { name: "Remove sort" }));

    await waitFor(() => expect(CALLS.at(-1)?.sort).toBeNull());

    expect({ ...router.state.location.search }).toStrictEqual({});
    expect(screen.queryByTestId("library-sort-chip")).toBeNull();
  });

  it("replaces the sort chip when another attribute is chosen, keeping the direction", async () => {
    await renderRoute(getRouter(), "/library?sort=AUTHOR_NAME&direction=DESC");

    fireEvent.click(await screen.findByRole("button", { name: "Sort" }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Author era" }),
    );

    await waitFor(() =>
      expect(CALLS.at(-1)?.sort).toStrictEqual({
        direction: LibrarySortDirection.Desc,
        field: LibrarySortField.AuthorEra,
      }),
    );

    expect(screen.getAllByTestId("library-sort-chip")).toHaveLength(1);
  });

  it("returns to the first page when the sort changes", async () => {
    const router = getRouter();
    await renderRoute(router, "/library?page=2");

    fireEvent.click(await screen.findByRole("button", { name: "Sort" }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Author name" }),
    );

    await waitFor(() => expect(CALLS.at(-1)?.page).toBe(1));

    expect(router.state.location.search.page).toBeUndefined();
  });

  it("resets every filter and the sort but keeps the search", async () => {
    const router = getRouter();
    await renderRoute(
      router,
      "/library?search=ecl&eras=%5B%22LATE%22%5D&sort=AUTHOR_NAME",
    );

    fireEvent.click(await screen.findByRole("button", { name: "Reset" }));

    await waitFor(() => expect(CALLS.at(-1)?.sort).toBeNull());

    expect(CALLS.at(-1)?.filters?.eras).toBeNull();
    expect({ ...router.state.location.search }).toStrictEqual({
      search: "ecl",
    });
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
  });

  it("keeps the filters and sort when a new search is submitted", async () => {
    await renderRoute(
      getRouter(),
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

  it("drops invalid filter and sort values to no chips", async () => {
    await renderRoute(
      getRouter(),
      "/library?eras=%5B%22NOPE%22%5D&sort=BOGUS&direction=UP&lineCountMinimum=abc&provinces=%5B%5D",
    );

    await screen.findByText("50 authors");

    expect(CALLS.at(-1)?.sort).toBeNull();
    expect(screen.queryByTestId("library-chips")).toBeNull();
  });

  it("reaches the toolbar controls and the chips with the keyboard", async () => {
    await renderRoute(
      getRouter(),
      "/library?eras=%5B%22LATE%22%5D&sort=AUTHOR_NAME",
    );

    const controls = [
      await screen.findByRole("searchbox", { name: "Search the library" }),
      screen.getByRole("button", { name: "Search" }),
      screen.getByRole("button", { name: /^Filter/u }),
      screen.getByRole("button", { name: "Sort" }),
      screen.getByRole("button", { name: "Era filter options" }),
      screen.getByRole("button", { name: /Switch to descending/u }),
      screen.getByRole("button", { name: "Remove sort" }),
      screen.getByRole("button", { name: "Reset" }),
    ];

    for (const control of controls) {
      control.focus();

      expect(document.activeElement).toBe(control);
    }
  });
});
