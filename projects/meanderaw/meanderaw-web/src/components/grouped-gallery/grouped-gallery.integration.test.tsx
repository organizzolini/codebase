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

/** A link's rows rule that every fixture meander satisfies. */
const ALL_ROWS = encodeURIComponent('{"operator":"gte","value":1}');

/** A filter near the caps renders every pill, slowly on CI. */
const HEAVY_FILTER_TIMEOUT_MILLISECONDS = 30_000;

describe("grouped gallery", () => {
  it("shows a header for each group with its exact count, and loads the cards of each", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["lattice"]')}`,
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

    expect(api.requests[0]?.filter).toStrictEqual({
      combinator: "AND",
      groups: [],
      rules: [
        { field: "isChain", flag: false, operator: "IS" },
        { field: "rows", numbers: [4], operator: "EQ" },
      ],
    });
  });

  it("nests a second level under the first, each with its own count", async () => {
    const api = serveMeandersApi(6);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["isChain","lattice"]')}`,
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
    const api = serveMeandersApi(30, 0, (index) => (index % 5) + 1);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["rowsColumns"]')}&rows=${ALL_ROWS}`,
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
    const api = serveMeandersApi(6, 0, (index) => (index % 5) + 1);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["rowsColumns"]')}&rows=${ALL_ROWS}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.filter).toStrictEqual({
      combinator: "AND",
      groups: [],
      rules: [
        { field: "rows", numbers: [1], operator: "EQ" },
        { field: "columns", numbers: [1], operator: "EQ" },
        { field: "rows", numbers: [1], operator: "GTE" },
      ],
    });
    expect(codesShown()[0]).toBe("01x01y0000r12");
  });

  it("reads a group's next page as its last rows come near", async () => {
    const api = serveMeandersApi(120);
    const notHeld = (): MeandersQueryVariables[] =>
      api.requests.filter(({ filter }) => filter?.rules?.[0]?.flag === false);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["isChain"]')}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(notHeld()).toHaveLength(1);

    scrollWindowTo(5200);

    await waitFor(() => {
      expect(notHeld().length).toBeGreaterThan(1);
    });

    expect(notHeld()[1]).toMatchObject({ after: "47" });
  });

  it(
    "reads the cards of each group at the filter's largest size, the key rules spliced into an AND filter",
    async () => {
      serveMeandersApi(6);
      const rule = { field: "rows", operator: "gte", value: 0 };
      // 125 rules, their group, the rows rule and the grouping's one key rule
      // fill the API's 128, which the mock API refuses beyond.
      const filter = {
        combinator: "and",
        rules: Array.from({ length: 125 }, () => rule),
      };

      await renderRoute(
        getRouter(),
        `/?view=grid&group=${encodeURIComponent('["lattice"]')}&filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );

      await waitFor(() => {
        expect(screen.getAllByTestId("meander-card")).toHaveLength(6);
      });
    },
    HEAVY_FILTER_TIMEOUT_MILLISECONDS,
  );

  it(
    "nests an OR filter whole, and reads its groups' cards at the deepest it can nest",
    async () => {
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
        `/?view=grid&group=${encodeURIComponent('["lattice"]')}&filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );

      await waitFor(() => {
        expect(screen.getAllByTestId("meander-card")).toHaveLength(6);
      });
    },
    HEAVY_FILTER_TIMEOUT_MILLISECONDS,
  );

  it(
    "says why a filter too large to read the groups' cards cannot be grouped",
    async () => {
      serveMeandersApi(6);
      const filter = {
        combinator: "and",
        rules: Array.from({ length: 126 }, () => ({
          field: "rows",
          operator: "gte",
          value: 0,
        })),
      };

      await renderRoute(
        getRouter(),
        `/?view=grid&group=${encodeURIComponent('["lattice"]')}&filter=${encodeURIComponent(JSON.stringify(filter))}`,
      );

      const alert = await screen.findByRole("alert");

      expect(alert.textContent).toMatch(/too large/u);
    },
    HEAVY_FILTER_TIMEOUT_MILLISECONDS,
  );

  it("groups within the rows rule and the filter, and orders each group's cards by the sort", async () => {
    const api = serveMeandersApi(6);
    const filter = {
      combinator: "and",
      rules: [{ field: "junctionCount", operator: "gte", value: 3 }],
    };

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["lattice"]')}&sort=junctionCount&direction=desc&filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );

    await screen.findAllByTestId("group-header");

    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual(["Lattice: 01", "Lattice: 11"]);

    // The groups and the cards are asked for within the same rules.
    for (const request of [api.groupRequests[0], api.requests[0]]) {
      expect(JSON.stringify(request?.filter)).toContain('"GTE"');
      expect(JSON.stringify(request?.filter)).toContain(
        '{"field":"rows","operator":"EQ","numbers":[4]}',
      );
    }

    await waitFor(() => {
      expect(codesShown()).toStrictEqual(["01x01y0002r12", "01x01y0003r12"]);
    });

    expect(api.requests[0]).toMatchObject({
      sort: { direction: "DESC", field: "junctionCount" },
    });
  });

  it("groups only the rows the Rows pill keeps, and asks again when the pill changes", async () => {
    const api = serveMeandersApi(6, 0, (index) => (index % 2) + 3);

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["rowsColumns"]')}`,
    );
    await screen.findAllByTestId("group-header");

    // Rows 4 are the odd positions: 1, 3 and 5, of columns 2, 1 and 3.
    expect(
      screen.getAllByTestId("group-header").map((header) => header.textContent),
    ).toStrictEqual([
      "Rows × columns: 4 × 11",
      "Rows × columns: 4 × 21",
      "Rows × columns: 4 × 31",
    ]);
    expect(api.groupRequests).toHaveLength(1);

    // The Rows pill stays on a grouped page, and edits in place.
    expect(
      within(screen.getByTestId("filter-pill-row"))
        .getAllByTestId("filter-pill")
        .map((pill) =>
          within(pill).getByRole("group").getAttribute("aria-label"),
        ),
    ).toStrictEqual(["Filter Rows"]);

    const value = screen.getByLabelText("Rows Value");

    fireEvent.change(value, { target: { value: "3" } });
    fireEvent.blur(value);

    await waitFor(() => {
      expect(api.groupRequests).toHaveLength(2);
    });
    await waitFor(() => {
      expect(
        screen
          .getAllByTestId("group-header")
          .map((header) => header.textContent),
      ).toStrictEqual([
        "Rows × columns: 3 × 11",
        "Rows × columns: 3 × 21",
        "Rows × columns: 3 × 31",
      ]);
    });
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
      "Rows × columns: 4 × 12",
    );
    expect({ ...router.state.location.search }).toStrictEqual({
      group: ["rowsColumns"],
      rows: { operator: "eq", value: 4 },
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
      `/?view=grid&group=${encodeURIComponent('["lattice"]')}`,
    );

    await expect(screen.findByTestId("gallery-empty")).resolves.toBeDefined();
  });

  it("shows why a group's cards failed to load, and reads them again when asked", async () => {
    const api = serveMeandersApi(6);
    api.failMeanders("The database is down");

    await renderRoute(
      getRouter(),
      `/?view=grid&group=${encodeURIComponent('["lattice"]')}`,
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
