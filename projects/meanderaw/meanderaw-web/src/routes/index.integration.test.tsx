import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../testing/meanders-api";
import { reachEnd, setViewportWidth } from "../../testing/viewport";
import { getRouter } from "../router";

import { Route } from "./index";

/** The cards in one row of the gallery, none for a row that is not there. */
function cardsIn(row: HTMLElement | undefined): HTMLElement[] {
  return row === undefined ? [] : within(row).queryAllByTestId("meander-card");
}

/** Picks a field in a category of the Sort cascader, opening the surface first. */
async function chooseSort(category: RegExp, name: RegExp): Promise<void> {
  await openSurface("Sort", "Sort");
  fireEvent.click(await screen.findByRole("option", { name: category }));
  fireEvent.click(await screen.findByRole("option", { name }));
}

/** Picks a view in the View cascader, opening the surface first. */
async function chooseView(name: RegExp | string): Promise<void> {
  await openSurface("View", "View");
  fireEvent.click(await screen.findByRole("option", { name }));
}

/** Closes the open surface, which leaves the page behind it readable again. */
async function closeSurface(): Promise<void> {
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

  await waitFor(() => {
    expect(screen.queryByRole("dialog")).toBeNull();
  });
}

/** The Codes of the cards on screen, in the order they appear. */
function codesShown(): string[] {
  return screen
    .getAllByTestId("meander-card")
    .map((card) =>
      within(card).getByRole("code").textContent.replace(/r\d+$/u, ""),
    );
}

/** The drawing a card shows, as the Code its image carries, decoded. */
function drawingOf(position: number): string {
  const image = screen.getAllByAltText(/^Drawing of meander/u)[position];

  return decodeURIComponent(image?.getAttribute("src") ?? "");
}

/** The text the control group of a name shows. */
function groupText(name: string): string {
  return screen
    .getByRole("group", { name })
    .textContent.replace(/^Page(?=\d)/u, "");
}

/** Opens the surface a toolbar button opens, and waits for it. */
async function openSurface(button: string, surface: string): Promise<void> {
  fireEvent.click(await screen.findByRole("button", { name: button }));
  await screen.findByRole("dialog", { name: surface });
}

/** Sets the Repeats chip's value, as a user does by typing and pressing Enter. */
async function setRepeats(value: string): Promise<void> {
  const chip = within(screen.getByRole("group", { name: "Filter" })).getByRole(
    "group",
    {
      name: /Repeats/u,
    },
  );

  fireEvent.click(within(chip).getByRole("button", { name: /12/u }));

  const box = await screen.findByRole("spinbutton", { name: "Repeats" });

  fireEvent.change(box, { target: { value } });
  fireEvent.keyDown(box, { key: "Enter" });
}

describe("index", () => {
  it("renders its page", async () => {
    serveMeandersApi();

    await renderRoute(getRouter(), "/");

    await expect(
      screen.findByRole("heading", { level: 1, name: "Meanderaw" }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/");
  });

  it("shows each meander as a card: drawing, Code with its repeats, badge and grouped pills", async () => {
    serveMeandersApi(3);

    await renderRoute(getRouter(), "/?group=%5B%5D");

    const cards = await screen.findAllByTestId("meander-card");

    expect(cards).toHaveLength(3);

    const [first, second] = cards.map((card) => within(card));

    expect(first?.getByRole("code").textContent).toBe("01x01y0000r12");
    expect(first?.getByText("Hardcoded")).toBeDefined();
    expect(
      first?.getAllByRole("listitem").map((pill) => pill.textContent),
    ).toStrictEqual(["Chain", "Junction count 1"]);
    expect(second?.queryByText("Hardcoded")).toBeNull();
  });

  it("groups by rows when the link names no grouping, and keeps rows when the last level is removed", async () => {
    const api = serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(groupText("Group")).toBe("GroupRows");
    expect(api.groupRequests[0]?.groupBy).toStrictEqual([{ field: "rows" }]);
    expect(router.state.location.search.group).toBeUndefined();

    fireEvent.click(
      screen.getByRole("button", { name: "Rows grouping options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    await waitFor(() => {
      expect(groupText("Group")).toBe("GroupRows");
    });

    expect(router.state.location.search.group).toBeUndefined();
  });

  it("copies the Code as shown, with its repeats", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    serveMeandersApi(1);

    await renderRoute(getRouter(), "/?group=%5B%5D&repeats=7");
    fireEvent.click(
      await screen.findByRole("button", { name: /Copy the Code/u }),
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("01x01y0000r7");
    });
  });

  it("opens on the grid, and switches to the list and back through the Display menu and the link", async () => {
    serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");

    expect(groupText("Display")).toBe("DisplayGrid");

    await openSurface("Display", "Display");
    fireEvent.click(await screen.findByRole("option", { name: /^List/u }));

    await waitFor(() => {
      expect(router.state.location.search.view).toBe("list");
    });
    await waitFor(() => {
      expect(
        screen.getByRole("group", { hidden: true, name: "Display" })
          .textContent,
      ).toBe("DisplayList");
    });

    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);

    fireEvent.click(await screen.findByRole("option", { name: /^Grid/u }));

    await waitFor(() => {
      expect(router.state.location.search.view).toBe("grid");
    });
  });

  it("applies a saved view: grouping by rows then columns, in the link and the buttons", async () => {
    serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/?view=grid");
    await screen.findAllByTestId("meander-card");
    await chooseView(/By rows then columns/u);

    await waitFor(() => {
      expect(router.state.location.search.group).toStrictEqual([
        "rows",
        "columns",
      ]);
    });

    expect(
      screen.getByRole("button", { hidden: true, name: "Grouped by Rows" }),
    ).toBeDefined();

    await waitFor(() => {
      expect(
        screen.getByRole("group", { hidden: true, name: "View" }).textContent,
      ).toBe("ViewBy rows then columns");
    });
  });

  it("opens on the list when the link names it", async () => {
    serveMeandersApi(2);

    await renderRoute(getRouter(), "/?group=%5B%5D&view=list");
    await screen.findAllByTestId("meander-card");

    expect(groupText("Display")).toBe("DisplayList");
    expect(groupText("View")).toBe("ViewCustom");
  });

  it("opens on the grid for a view it does not know", async () => {
    serveMeandersApi(2);

    await renderRoute(getRouter(), "/?view=wall");
    await screen.findAllByTestId("meander-card");

    expect(groupText("Display")).toBe("DisplayGrid");
    expect(groupText("View")).toBe("ViewDefault");
  });

  it("says so when there are no meanders yet", async () => {
    serveMeandersApi(0);

    await renderRoute(getRouter(), "/?group=%5B%5D");

    await expect(screen.findByTestId("gallery-empty")).resolves.toBeDefined();
    expect(screen.queryAllByTestId("meander-card")).toHaveLength(0);
  });

  it("says no meander matches, not that none are stored, when a filter leaves none", async () => {
    serveMeandersApi(3);
    const filter = encodeURIComponent(
      JSON.stringify({
        combinator: "and",
        rules: [{ field: "columns", operator: "eq", value: 9 }],
      }),
    );

    await renderRoute(getRouter(), `/?group=%5B%5D&filter=${filter}`);

    const notice = await screen.findByTestId("gallery-empty");

    expect(notice.textContent).toMatch(/No meanders match these filters/u);
  });

  it("folds every strip onto lines as one-line segments", async () => {
    serveMeandersApi(3);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");

    for (const name of [
      "View",
      "Display",
      "Group",
      "Sort",
      "Filter",
      "Pages",
    ]) {
      expect(screen.getByRole("group", { name }).className).toContain(
        "gallery-strip",
      );
    }
  });

  it("shows why the load failed, and loads again when asked", async () => {
    const api = serveMeandersApi(2);
    api.fail("The database is down");

    await renderRoute(getRouter(), "/?group=%5B%5D");

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toMatch(/The database is down/u);

    api.recover();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await expect(screen.findAllByTestId("meander-card")).resolves.toHaveLength(
      2,
    );
  });

  it("mounts only the rows in view, however many meanders there are", async () => {
    serveMeandersApi(500);

    await renderRoute(getRouter(), "/?group=%5B%5D");

    const mounted = await screen.findAllByTestId("meander-card");

    expect(mounted.length).toBeGreaterThan(0);
    expect(mounted.length).toBeLessThan(25);
    expect(groupText("Pages")).toBe("1 to 24 of 500");
  });

  it("puts as many cards in a row as the width holds", async () => {
    serveMeandersApi(40);
    setViewportWidth(1280);

    await renderRoute(getRouter(), "/?group=%5B%5D&view=grid");

    const [row] = await screen.findAllByTestId("meander-gallery-row");

    expect(cardsIn(row)).toHaveLength(3);
  });

  it("puts one card in a row on a phone", async () => {
    serveMeandersApi(40);
    setViewportWidth(375);

    await renderRoute(getRouter(), "/?group=%5B%5D&view=grid");

    const [row] = await screen.findAllByTestId("meander-gallery-row");

    expect(cardsIn(row)).toHaveLength(1);
  });

  it("sorts by rows ascending when the link names no sort, and says so", async () => {
    const api = serveMeandersApi(3);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.sort).toStrictEqual([
      { direction: "ASC", field: "rows" },
    ]);
    expect(groupText("Sort")).toBe("SortRows");
  });

  it("shows the first page of 24 with its range, and no page before it", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");

    expect(groupText("Pages")).toBe("1 to 24 of 100");
    expect(api.requests).toHaveLength(1);
    expect(api.requests[0]).toMatchObject({ first: 24 });
    expect(
      screen
        .getByRole("button", { name: "Previous page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("pages by offset with the arrows, reading each page once and showing it alone", async () => {
    const api = serveMeandersApi(100);
    const scrollTo = vi.spyOn(globalThis, "scrollTo");

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(groupText("Pages")).toBe("25 to 48 of 100");
    });
    await waitFor(() => {
      expect(codesShown()[0]).toBe("01x01y0024");
    });

    expect(api.requests[1]).toMatchObject({ first: 24, offset: 24 });
    // Moving to another page scrolls to the top.
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));

    expect(groupText("Pages")).toBe("1 to 24 of 100");
    expect(codesShown()[0]).toBe("01x01y0000");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(groupText("Pages")).toBe("25 to 48 of 100");
    expect(api.requests).toHaveLength(2);

    scrollTo.mockRestore();
  });

  it("adds the next page at the bottom of the page, selecting both, and keeps the scroll place", async () => {
    const api = serveMeandersApi(100);
    const scrollTo = vi.spyOn(globalThis, "scrollTo");

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    scrollTo.mockClear();
    act(() => {
      reachEnd();
    });

    await waitFor(() => {
      expect(groupText("Pages")).toBe("1 to 48 of 100");
    });
    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests[1]).toMatchObject({ first: 24, offset: 24 });
    expect(scrollTo).not.toHaveBeenCalled();

    // The next arrow selects the page after the window alone.
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(groupText("Pages")).toBe("49 to 72 of 100");

    scrollTo.mockRestore();
  });

  it("checks every page of the window in the Page menu, and goes back to one alone", async () => {
    serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    act(() => {
      reachEnd();
    });
    await waitFor(() => {
      expect(groupText("Pages")).toBe("1 to 48 of 100");
    });
    fireEvent.click(screen.getByRole("button", { name: /Page$/u }));

    const checked = (): (null | string)[] =>
      screen
        .getAllByRole("menuitemcheckbox")
        .filter((item) => item.getAttribute("aria-checked") === "true")
        .map(({ textContent }) => textContent);

    await waitFor(() => {
      expect(checked()).toStrictEqual(["Page 1", "Page 2"]);
    });

    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Page 2" }));

    await waitFor(() => {
      expect(groupText("Pages")).toBe("25 to 48 of 100");
    });
    await waitFor(() => {
      expect(checked()).toStrictEqual(["Page 2"]);
    });
  });

  it("has no next arrow past the last page, and the last page shortens the range", async () => {
    serveMeandersApi(30);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    act(() => {
      reachEnd();
    });

    await waitFor(() => {
      expect(groupText("Pages")).toBe("1 to 30 of 30");
    });

    expect(
      screen
        .getByRole("button", { name: "Next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("changes the page size from the Page menu, in the link and the request, starting over from page 1", async () => {
    const api = serveMeandersApi(100);
    const router = getRouter();

    await renderRoute(router, "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    act(() => {
      reachEnd();
    });
    await waitFor(() => {
      expect(groupText("Pages")).toBe("1 to 48 of 100");
    });
    fireEvent.click(screen.getByRole("button", { name: /Page$/u }));
    fireEvent.click(await screen.findByRole("menuitemradio", { name: "12" }));

    await waitFor(() => {
      expect(router.state.location.search.size).toBe(12);
    });
    await waitFor(() => {
      expect(groupText("Pages")).toBe("1 to 12 of 100");
    });

    expect(api.requests.at(-1)).toMatchObject({ first: 12 });
  });

  it("goes straight to a page picked in the Page menu, by an offset, selecting it alone", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: /Page$/u }));
    fireEvent.click(
      await screen.findByRole("menuitemcheckbox", { name: "Page 4" }),
    );

    await waitFor(() => {
      expect(groupText("Pages")).toBe("73 to 96 of 100");
    });

    expect(api.requests.at(-1)).toMatchObject({ offset: 72 });
  });

  it("goes back to the first page when the sort changes", async () => {
    serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    act(() => {
      reachEnd();
    });
    await waitFor(() => {
      expect(groupText("Pages")).toBe("1 to 48 of 100");
    });
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    await waitFor(() => {
      expect(groupText("Pages")).toBe("49 to 72 of 100");
    });
    await chooseSort(/Path/u, /Junction count/u);

    await waitFor(() => {
      expect(groupText("Pages")).toBe("1 to 24 of 100");
    });
  });

  it("opens on the page size the link names", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D&size=48");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]).toMatchObject({ first: 48 });
    expect(groupText("Pages")).toBe("1 to 48 of 100");
  });

  it("shows why the next page failed, and reads it again when asked", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    api.fail("The database is down");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toMatch(/The database is down/u);
    expect(groupText("Pages")).toBe("1 to 24 of 100");

    api.recover();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });

    expect(api.requests.at(-1)).toMatchObject({ offset: 24 });
  });

  it("offers the shape fields and the catalog to sort by in a cascader, by category, with their descriptions", async () => {
    serveMeandersApi(3);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    await openSurface("Sort", "Sort");

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual([
      expect.stringContaining("Shape"),
      expect.stringContaining("Path"),
      expect.stringContaining("Submatrix"),
    ]);

    fireEvent.click(screen.getByRole("option", { name: /Shape/u }));

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual([
      expect.stringContaining("Rows"),
      expect.stringContaining("Columns"),
      expect.stringContaining("Lattice"),
      expect.stringContaining("Repeats"),
      expect.stringContaining("Hardcoded"),
      expect.stringContaining("Code"),
    ]);
    expect(screen.getByText("How many rows the meander has")).toBeDefined();
  });

  // The mock API sorts like the real one, so the order of the cards shown proves
  // the page sends the sort and shows the answer in the order it came, not that
  // the API sorts correctly: that is the API's own end-to-end suite.
  it("puts the field ticked in the link, asks the API for it, and shows the answer in order", async () => {
    const api = serveMeandersApi(6);
    const router = getRouter();

    await renderRoute(router, "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");

    // The list mounts only the rows in view and a few past them.
    expect(codesShown().slice(0, 5)).toStrictEqual([
      "01x01y0000",
      "01x01y0001",
      "01x01y0002",
      "01x01y0003",
      "01x01y0004",
    ]);

    await chooseSort(/Shape/u, /Columns/u);
    await closeSurface();

    await waitFor(() => {
      expect(router.state.location.search.sort).toStrictEqual([
        { direction: "asc", field: "rows" },
        { direction: "asc", field: "columns" },
      ]);
    });
    await waitFor(() => {
      expect(codesShown().slice(0, 2)).toStrictEqual([
        "01x01y0000",
        "01x01y0003",
      ]);
    });

    expect(api.requests.at(-1)).toMatchObject({
      sort: [
        { direction: "ASC", field: "rows" },
        { direction: "ASC", field: "columns" },
      ],
    });
  });

  it("flips the direction of a field from its menu, in the link and the request, and drops the sort with its last field", async () => {
    serveMeandersApi(6);
    const router = getRouter();

    await renderRoute(router, "/?group=%5B%5D&sort=columns");
    await screen.findAllByTestId("meander-card");

    fireEvent.click(
      screen.getByRole("button", { name: "Columns sorting options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Reverse" }));

    await waitFor(() => {
      expect(codesShown()[0]).toBe("01x01y0002");
    });

    expect(router.state.location.search.sort).toStrictEqual([
      { direction: "desc", field: "columns" },
    ]);

    fireEvent.click(
      screen.getByRole("button", { name: "Columns sorting options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    await waitFor(() => {
      expect(codesShown()[0]).toBe("01x01y0000");
    });

    expect(router.state.location.search.sort).toBeUndefined();
  });

  it("opens sorted by a characteristic when the link names one, and pages in that sort", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(
      getRouter(),
      "/?group=%5B%5D&sort=junctionCount&direction=desc",
    );
    await screen.findAllByTestId("meander-card");

    expect(groupText("Sort")).toBe("SortJunction count");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests[1]).toMatchObject({
      offset: 24,
      sort: [{ direction: "DESC", field: "junctionCount" }],
    });
  });

  it("pages by offset in the order of several sorts", async () => {
    const api = serveMeandersApi(100);
    const sort = encodeURIComponent(
      JSON.stringify([
        { direction: "desc", field: "junctionCount" },
        { direction: "asc", field: "rows" },
      ]),
    );

    await renderRoute(getRouter(), `/?group=%5B%5D&sort=${sort}`);
    await screen.findAllByTestId("meander-card");

    expect(groupText("Sort")).toBe("SortJunction countRows");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests[1]).toMatchObject({
      offset: 24,
      sort: [
        { direction: "DESC", field: "junctionCount" },
        { direction: "ASC", field: "rows" },
      ],
    });
  });

  it("falls back to the default order when the link names a sort that is not a field", async () => {
    const api = serveMeandersApi(3);

    await renderRoute(getRouter(), "/?group=%5B%5D&sort=nope&direction=desc");
    await screen.findAllByTestId("meander-card");

    expect(codesShown()).toStrictEqual([
      "01x01y0000",
      "01x01y0001",
      "01x01y0002",
    ]);
    expect(api.requests[0]?.sort).toStrictEqual([
      { direction: "ASC", field: "rows" },
    ]);
    expect(groupText("Sort")).toBe("SortRows");
  });

  it("shows why the first page failed, whatever the sort", async () => {
    const api = serveMeandersApi(3);
    api.fail("The database is down");

    await renderRoute(getRouter(), "/?group=%5B%5D&sort=rows");

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toMatch(/The database is down/u);
    expect(screen.queryAllByTestId("meander-card")).toHaveLength(0);
  });

  it("says it is loading while a new sort reads, keeping the cards up", async () => {
    serveMeandersApi(3, 150);

    await renderRoute(getRouter(), "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");
    await chooseSort(/Shape/u, /Rows/u);

    await screen.findByText("Loading…");

    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).toBeNull();
    });
  });

  it("asks for each drawing with its tile repeated 12 times, on the first page and the next", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D");

    const [image] = await screen.findAllByAltText(/^Drawing of meander/u);
    const drawing = decodeURIComponent(image?.getAttribute("src") ?? "");

    expect(drawing).toContain('data-repeats="12"');

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests.map(({ repeats }) => repeats)).toStrictEqual([12, 12]);
  });

  it("shows repeats = 12 as a chip that cannot be removed, and changes it in the link, the request and the drawing", async () => {
    const api = serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/?group=%5B%5D");
    await screen.findAllByTestId("meander-card");

    const chips = screen.getByRole("group", { name: "Filter" });

    expect(chips.textContent).toContain("Repeats");
    expect(
      within(chips).queryByRole("button", { name: /Remove Repeats/u }),
    ).toBeNull();

    await setRepeats("3");

    await waitFor(() => {
      expect(router.state.location.search.repeats).toBe(3);
    });
    await waitFor(() => {
      expect(drawingOf(0)).toContain('data-repeats="3"');
    });

    expect(api.requests.at(-1)).toMatchObject({ repeats: 3 });
    expect(api.requests.at(-1)?.after).toBeUndefined();
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);
  });

  it("reads the cards of every group again with the new repeats, when grouped", async () => {
    const api = serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(drawingOf(0)).toContain('data-repeats="12"');

    await setRepeats("3");

    await waitFor(() => {
      expect(drawingOf(0)).toContain('data-repeats="3"');
    });

    expect(router.state.location.search.repeats).toBe(3);
    expect(api.requests.at(-1)).toMatchObject({ repeats: 3 });
    expect(api.requests.map(({ repeats }) => repeats)).toStrictEqual([12, 3]);
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);
  });

  it("falls back to 12 repeats for a link that names 25", async () => {
    const api = serveMeandersApi(2);

    await renderRoute(getRouter(), "/?group=%5B%5D&repeats=25");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.repeats).toBe(12);
    expect(drawingOf(0)).toContain('data-repeats="12"');
  });

  it("accepts 24 repeats, the most the API allows", async () => {
    const api = serveMeandersApi(1);

    await renderRoute(getRouter(), "/?group=%5B%5D&repeats=24");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.repeats).toBe(24);
    expect(drawingOf(0)).toContain('data-repeats="24"');
  });

  it("falls back to 12 repeats for a link that names text", async () => {
    const api = serveMeandersApi(2);

    await renderRoute(getRouter(), "/?group=%5B%5D&repeats=abc");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.repeats).toBe(12);
    expect(screen.getByRole("group", { name: "Filter" }).textContent).toContain(
      "12",
    );
  });

  it("opens on the repeats the link names, and pages with them", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?group=%5B%5D&repeats=2");
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests.map(({ repeats }) => repeats)).toStrictEqual([2, 2]);
  });
});
