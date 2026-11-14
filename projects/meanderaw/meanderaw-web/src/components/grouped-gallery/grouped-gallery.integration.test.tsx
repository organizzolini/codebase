import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../testing/meanders-api";
import { scrollWindowTo } from "../../../testing/viewport";
import { getRouter } from "../../router";

import type { MeandersQueryVariables } from "../../graphql/generated/operations";

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

/** The groups the cards of which were read, as the rows × columns of each. */
function requestedGroups(
  requests: readonly MeandersQueryVariables[],
): string[] {
  return requests.map((request) => {
    const [rows, columns] = request.filter?.rules ?? [];

    return `${String(rows?.numbers?.[0])}x${String(columns?.numbers?.[0])}`;
  });
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

  it("keeps the 0 or false bucket as its own group, and loads its cards", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["isChain"]')}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Chain: Not held4", "Chain: Held2"]);

    await waitFor(() => {
      expect(codesShown()).toStrictEqual([
        "01x01y0001",
        "01x01y0002",
        "01x01y0004",
        "01x01y0005",
        "01x01y0000",
        "01x01y0003",
      ]);
    });

    expect(api.requests[0]?.filter).toStrictEqual({
      combinator: "AND",
      groups: [],
      rules: [{ field: "isChain", flag: false, operator: "IS" }],
    });
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

    const before = requestedGroups(api.requests);

    expect(before).toContain("1x1");
    expect(before.length).toBeLessThan(15);
    expect(before).not.toContain("5x3");

    scrollWindowTo(6000);

    await waitFor(() => {
      expect(requestedGroups(api.requests)).toContain("5x3");
    });
  });

  it("reads a rows × columns group's cards by its rows and its columns", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["rowsColumns"]')}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.filter).toStrictEqual({
      combinator: "AND",
      groups: [],
      rules: [
        { field: "rows", numbers: [1], operator: "EQ" },
        { field: "columns", numbers: [1], operator: "EQ" },
      ],
    });
    expect(codesShown()[0]).toBe("01x01y0000");
  });

  it("reads a group's next page as its last rows come near", async () => {
    const api = serveMeandersApi(120);
    const notHeld = (): MeandersQueryVariables[] =>
      api.requests.filter(({ filter }) => filter?.rules?.[0]?.flag === false);

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["isChain"]')}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(notHeld()).toHaveLength(1);

    scrollWindowTo(3300);

    await waitFor(() => {
      expect(notHeld().length).toBeGreaterThan(1);
    });

    expect(notHeld()[1]).toMatchObject({ after: "47" });
  });

  it("reads the cards of each group at the filter's largest size, the key rules spliced into an AND filter", async () => {
    serveMeandersApi(6);
    const rule = { field: "rows", operator: "gte", value: 0 };
    // 127 rules and the one key rule of the grouping fill the API's 128,
    // which the mock API refuses beyond.
    const filter = {
      combinator: "and",
      rules: Array.from({ length: 127 }, () => rule),
    };

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["lattice"]')}&filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card")).toHaveLength(6);
    });
  });

  it("nests an OR filter whole, and reads its groups' cards at the deepest it can nest", async () => {
    serveMeandersApi(6);
    let filter: unknown = {
      combinator: "or",
      rules: [{ field: "rows", operator: "gte", value: 0 }],
    };

    for (let level = 1; level < 5; level += 1) {
      filter = { combinator: "or", rules: [filter] };
    }

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["lattice"]')}&filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("meander-card")).toHaveLength(6);
    });
  });

  it("says why a filter too large to read the groups' cards cannot be grouped", async () => {
    serveMeandersApi(6);
    const filter = {
      combinator: "and",
      rules: Array.from({ length: 128 }, () => ({
        field: "rows",
        operator: "gte",
        value: 0,
      })),
    };

    await renderRoute(
      getRouter(),
      `/?group=${encodeURIComponent('["lattice"]')}&filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toMatch(/too large/u);
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
