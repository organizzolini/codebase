import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../../testing/meanders-api";
import { reachEnd, setViewportWidth } from "../../../../testing/viewport";
import { getRouter } from "../../../router";

/** The cards in one row of the gallery, none for a row that is not there. */
function cardsIn(row: HTMLElement | undefined): HTMLElement[] {
  return row === undefined ? [] : within(row).queryAllByTestId("meander-card");
}

/** The Codes of the cards on screen, in the order they appear. */
function codesShown(): string[] {
  return screen
    .getAllByTestId("meander-card")
    .map((card) => within(card).getByRole("code").textContent);
}

/** A link's rows rule that every fixture meander satisfies. */
const ALL_ROWS = encodeURIComponent('{"operator":"gte","value":1}');

describe("grouped gallery", () => {
  it("shows a header for each group with its exact count, and the cards of each in one read", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["columns"]')}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Columns: 12", "Columns: 22", "Columns: 32"]);
    expect(api.groupRequests[0]?.groupBy).toStrictEqual([{ field: "columns" }]);

    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card")).toHaveLength(6);
    });

    // One read asks for the cards in the order of the groups, then the sort.
    expect(api.requests).toHaveLength(1);
    expect(api.requests[0]).toMatchObject({
      first: 24,
      sort: [
        { direction: "ASC", field: "columns" },
        { direction: "ASC", field: "rows" },
      ],
    });
  });

  it("keeps the 0 or false bucket as its own group, ahead of the held ones", async () => {
    const api = serveMeandersApi(6);

    // One column, so the cards read in the order they are laid out.
    setViewportWidth(375);
    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["isChain"]')}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Chain: Not held4", "Chain: Held2"]);

    await waitFor(() => {
      expect(codesShown()).toStrictEqual([
        "01x01y0001r12",
        "01x01y0002r12",
        "01x01y0004r12",
        "01x01y0005r12",
        "01x01y0000r12",
        "01x01y0003r12",
      ]);
    });

    expect(api.requests[0]).toMatchObject({
      filter: {
        combinator: "AND",
        rules: [{ field: "rows", numbers: [4], operator: "EQ" }],
      },
      sort: [
        { direction: "ASC", field: "isChain" },
        { direction: "ASC", field: "rows" },
      ],
    });
  });

  it("nests a second level under the first, each with its own count", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["isChain","columns"]')}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen
        .getAllByTestId("group-header")
        .slice(0, 2)
        .map((header) => header.textContent),
    ).toStrictEqual(["Chain: Not held4", "Columns: 22"]);
    expect(api.groupRequests[0]?.groupBy).toStrictEqual([
      { field: "isChain" },
      { field: "columns" },
    ]);
  });

  it("orders the cards by every level, then the sort, as one sequence", async () => {
    const api = serveMeandersApi(6, 0, (index) => (index % 5) + 1);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["rows","columns"]')}&rows=${ALL_ROWS}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.sort).toStrictEqual([
      { direction: "ASC", field: "rows" },
      { direction: "ASC", field: "columns" },
    ]);
    expect(codesShown()[0]).toBe("01x01y0000r12");
  });

  it("adds the next page to the window at the bottom of the page, growing the range", async () => {
    const api = serveMeandersApi(30, 0, (index) => (index < 7 ? 1 : 2));

    await renderRoute(
      getRouter(),
      `/?view=grid&size=12&group=${encodeURIComponent('["rows"]')}&rows=${ALL_ROWS}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("1 to 12 of 30")).toBeDefined();

    act(() => {
      reachEnd();
    });

    await waitFor(() => {
      expect(screen.getByText("1 to 24 of 30")).toBeDefined();
    });
    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests.map(({ offset }) => offset ?? 0)).toStrictEqual([
      0, 12,
    ]);
    // The first group keeps its header, with the count of all its meanders.
    expect(screen.getAllByTestId("group-header")[0]?.textContent).toBe(
      "Rows: 17",
    );
  });

  it("shows a group again, as continued, on a page the group runs onto", async () => {
    serveMeandersApi(30, 0, (index) => (index < 7 ? 1 : 2));

    await renderRoute(
      getRouter(),
      `/?view=grid&size=12&group=${encodeURIComponent('["rows"]')}&rows=${ALL_ROWS}`,
    );
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(screen.getByText("13 to 24 of 30")).toBeDefined();
    });
    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card")).toHaveLength(12);
    });

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Rows: 2 (continued)23"]);
  });

  it("groups within the rows rule and the filter, and orders the cards by the levels, then the sort", async () => {
    const api = serveMeandersApi(6);
    const filter = {
      combinator: "and",
      rules: [{ field: "junctionCount", operator: "gte", value: 3 }],
    };

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["columns"]')}&sort=junctionCount&direction=desc&filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Columns: 11", "Columns: 31"]);

    // The groups and the cards are asked for within the same rules.
    for (const request of [api.groupRequests[0], api.requests[0]]) {
      expect(JSON.stringify(request?.filter)).toContain('"GTE"');
      expect(JSON.stringify(request?.filter)).toContain(
        '{"field":"rows","operator":"EQ","numbers":[4]}',
      );
    }

    await waitFor(() => {
      expect(codesShown()).toStrictEqual(["01x01y0003r12", "01x01y0002r12"]);
    });

    expect(api.requests[0]).toMatchObject({
      sort: [
        { direction: "ASC", field: "columns" },
        { direction: "DESC", field: "junctionCount" },
      ],
    });
  });

  it("groups only the rows the Rows chip keeps, and asks again when the chip changes", async () => {
    const api = serveMeandersApi(6, 0, (index) => (index % 2) + 3);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["rows","columns"]')}`,
    );
    await screen.findAllByTestId("group-header");

    // Rows 4 are the odd positions: 1, 3 and 5, of columns 2, 1 and 3.
    expect(
      screen
        .getAllByTestId("group-header")
        .slice(0, 3)
        .map((header) => header.textContent),
    ).toStrictEqual(["Rows: 43", "Columns: 11", "Columns: 21"]);
    expect(api.groupRequests).toHaveLength(1);
    expect(api.groupRequests[0]?.groupBy).toStrictEqual([
      { field: "rows" },
      { field: "columns" },
    ]);

    // The Rows chip stays on a grouped page, and edits in place.
    const chip = within(
      screen.getByRole("group", { name: "Filter" }),
    ).getByRole("group", { name: /Rows/u });

    fireEvent.click(within(chip).getByRole("button", { name: /4/u }));

    const value = await screen.findByRole("spinbutton", { name: "Rows" });

    fireEvent.change(value, { target: { value: "3" } });
    fireEvent.keyDown(value, { key: "Enter" });

    await waitFor(() => {
      expect(api.groupRequests).toHaveLength(2);
    });
    await waitFor(() => {
      expect(
        screen
          .getAllByTestId("group-header")
          .slice(0, 3)
          .map((header) => header.textContent),
      ).toStrictEqual(["Rows: 33", "Columns: 11", "Columns: 21"]);
    });
  });

  it("groups from the Group menu, and opens the same view from the link it wrote", async () => {
    serveMeandersApi(6);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: "Group" }));
    fireEvent.click(await screen.findByRole("option", { name: /Shape/u }));
    fireEvent.click(await screen.findByRole("option", { name: /Columns/u }));

    await waitFor(() => {
      expect(screen.getAllByTestId("group-header").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByTestId("group-header")[0]?.textContent).toBe(
      "Rows: 46",
    );
    expect(router.state.location.search).toMatchObject({
      group: ["rows", "columns"],
      rows: { operator: "eq", value: 4 },
    });
  });

  it("groups the list view too, one column of cards", async () => {
    serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?view=list&group=${encodeURIComponent('["columns"]')}`,
    );

    const columns = await screen.findAllByTestId("masonry-column");

    // One column to each group of cards.
    expect(columns).toHaveLength(3);
    expect(cardsIn(columns[0]).length).toBeGreaterThan(0);
  });

  it("says so when no meander is left to group", async () => {
    serveMeandersApi(0);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["columns"]')}`,
    );

    await expect(screen.findByTestId("gallery-empty")).resolves.toBeDefined();
  });

  it("shows why the meanders failed to load, and reads them again when asked", async () => {
    const api = serveMeandersApi(6);
    api.failMeanders("The database is down");

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["columns"]')}`,
    );

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toMatch(/The database is down/u);

    api.recover();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card").length).toBeGreaterThan(0);
    });
  });
});
