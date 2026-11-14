import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../testing/meanders-api";
import { scrollWindowTo } from "../../../testing/viewport";
import { getRouter } from "../../router";

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

describe("grouped gallery", () => {
  it("shows a header for each group with its exact count, and loads the cards of each", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["lattice"]')}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Lattice: 03", "Lattice: 13"]);
    expect(api.groupRequests[0]?.groupBy).toStrictEqual([{ field: "lattice" }]);
    expect(screen.getByText("6 meanders")).toBeDefined();

    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card")).toHaveLength(6);
    });
  });

  it("keeps the 0 or false bucket as its own group", async () => {
    serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["isChain"]')}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Chain: Not held4", "Chain: Held2"]);
  });

  it("nests a second level under the first, each with its own count", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["isChain","lattice"]')}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen
        .getAllByTestId("group-header")
        .slice(0, 2)
        .map((header) => header.textContent),
    ).toStrictEqual(["Chain: Not held4", "Lattice: 02"]);
    expect(api.groupRequests[0]?.groupBy).toStrictEqual([
      { field: "isChain" },
      { field: "lattice" },
    ]);
  });

  it("reads a group's cards only as its header comes near the screen", async () => {
    const api = serveMeandersApi(30);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["rowsColumns"]')}`,
    );
    await screen.findAllByTestId("meander-card");

    const before = api.requests.length;

    expect(before).toBeGreaterThan(0);
    expect(before).toBeLessThan(15);
    expect(api.requests[0]?.filter).toMatchObject({
      combinator: "AND",
      rules: [{ field: "rows" }, { field: "columns" }],
    });

    scrollWindowTo(6000);

    await waitFor(() => {
      expect(api.requests.length).toBeGreaterThan(before);
    });
  });

  it("groups within the filter, and orders each group's cards by the sort", async () => {
    const api = serveMeandersApi(6);
    const filter = {
      combinator: "and",
      rules: [{ field: "rows", operator: "gte", value: 3 }],
    };

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["lattice"]')}&sort=rows&direction=desc&filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Lattice: 02", "Lattice: 11"]);
    expect(api.groupRequests[0]?.filter).toMatchObject({ combinator: "AND" });

    await waitFor(() => {
      expect(codesShown()).toStrictEqual([
        "01x01y0004",
        "01x01y0002",
        "01x01y0003",
      ]);
    });

    expect(api.requests[0]).toMatchObject({
      sort: { direction: "DESC", field: "rows" },
    });
    expect(JSON.stringify(api.requests[0]?.filter)).toContain('"GTE"');
  });

  it("groups from the builder, and opens the same view from the link it wrote", async () => {
    serveMeandersApi(6);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: "Group cards" }));

    await waitFor(() => {
      expect(screen.getAllByTestId("group-header").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByTestId("group-header")[0]?.textContent).toBe(
      "Rows × columns: 1 × 11",
    );
    expect({ ...router.state.location.search }).toStrictEqual({
      group: ["rowsColumns"],
    });
  });

  it("groups the list view too, one card to a row", async () => {
    serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?view=list&group=${encodeURIComponent('["lattice"]')}`,
    );

    const [row] = await screen.findAllByTestId("group-cards-row");

    expect(cardsIn(row)).toHaveLength(1);
  });

  it("says so when no meander is left to group", async () => {
    serveMeandersApi(0);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["lattice"]')}`,
    );

    await expect(screen.findByTestId("gallery-empty")).resolves.toBeDefined();
  });

  it("shows why a group's cards failed to load, and reads them again when asked", async () => {
    const api = serveMeandersApi(6);
    api.failMeanders("The database is down");

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["lattice"]')}`,
    );

    const [alert] = await screen.findAllByRole("alert");

    expect(alert?.textContent).toMatch(/The database is down/u);

    api.recover();

    for (const retry of screen.getAllByRole("button", { name: "Try again" })) {
      fireEvent.click(retry);
    }

    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card").length).toBeGreaterThan(0);
    });
  });
});
