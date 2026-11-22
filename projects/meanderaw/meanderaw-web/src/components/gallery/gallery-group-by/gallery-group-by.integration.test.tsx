import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../../testing/meanders-api";
import { getRouter } from "../../../router";

/** Opens the Group surface. */
async function openGroup(): Promise<void> {
  fireEvent.click(await screen.findByRole("button", { name: "Group" }));
  await screen.findByRole("dialog", { name: "Group" });
}

describe("gallery group-by", () => {
  it("ticks and clears levels, keeping them in the link, and groups by rows again with none left", async () => {
    serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    // The link gains the rows rule it opened on, before the page is changed.
    await waitFor(() => {
      expect(router.state.location.search.rows).toStrictEqual({
        operator: "eq",
        value: 4,
      });
    });
    await openGroup();
    fireEvent.click(screen.getByRole("option", { name: /Shape/u }));
    fireEvent.click(screen.getByRole("option", { name: /Columns/u }));

    await waitFor(() => {
      expect(router.state.location.search.group).toStrictEqual([
        "rows",
        "columns",
      ]);
    });

    // The level shows once the page has read, so the next tick builds on it.
    await screen.findByRole("button", {
      hidden: true,
      name: "Grouped by Columns",
    });
    fireEvent.click(screen.getByRole("option", { name: /Rows/u }));

    await waitFor(() => {
      expect(router.state.location.search.group).toStrictEqual(["columns"]);
    });

    fireEvent.click(
      screen.getByRole("button", {
        hidden: true,
        name: "Columns grouping options",
      }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    await waitFor(() => {
      expect(router.state.location.search.group).toBeUndefined();
    });

    // With no level left the page groups by rows again.
    expect(
      screen.getByRole("button", { hidden: true, name: "Grouped by Rows" }),
    ).toBeDefined();
  });

  it("opens on the levels a shared link names, leaving out the unknown and the repeated", async () => {
    serveMeandersApi(3);

    await renderRoute(
      getRouter(),
      '/?group=["isChain","nonsense","isChain","columns"]',
    );

    await expect(
      screen.findByRole("button", { name: "Grouped by Chain" }),
    ).resolves.toBeDefined();
    expect(
      screen.getByRole("button", { name: "Grouped by Columns" }),
    ).toBeDefined();
    expect(
      screen.queryByRole("button", { name: /Grouped by Nonsense/u }),
    ).toBeNull();
    expect(
      screen.getAllByRole("button", { name: /^Grouped by/u }),
    ).toHaveLength(2);
  });

  it("groups by rows, columns and a characteristic, nested, asking the API for every level", async () => {
    const api = serveMeandersApi(8, 0, (index) => (index % 2) + 3);

    await renderRoute(
      getRouter(),
      '/?view=grid&group=["rows","columns","junctionCount"]&rows={"operator":"gte","value":0}',
    );
    await waitFor(() => {
      expect(api.groupRequests.at(-1)?.groupBy).toStrictEqual([
        { field: "rows" },
        { field: "columns" },
        { field: "junctionCount" },
      ]);
    });

    await expect(screen.findByText("Rows: 3")).resolves.toBeDefined();
    expect(screen.getAllByText(/^Columns: /u).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/^Junction count: /u).length).toBeGreaterThan(1);
  });
});
