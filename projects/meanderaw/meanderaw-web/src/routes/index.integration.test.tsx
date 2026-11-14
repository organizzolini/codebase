import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../testing/meanders-api";
import { scrollWindowTo, setViewportWidth } from "../../testing/viewport";
import { getRouter } from "../router";

import { Route } from "./index";

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

/**
 * Sets a control by its label and waits until the link has carried the edit
 * back to it, so the next edit builds on it. A rule's editor is replaced when
 * its field or operator changes, so the control is found again each time.
 */
async function setControl(
  label: string,
  value: string,
  scope: Pick<typeof screen, "findByLabelText" | "getByLabelText"> = screen,
): Promise<void> {
  fireEvent.change(await scope.findByLabelText(label), { target: { value } });

  await waitFor(() => {
    expect(scope.getByLabelText<HTMLInputElement>(label).value).toBe(value);
  });
}

describe("index", () => {
  it("renders its page", async () => {
    serveMeandersApi();

    await renderRoute(getRouter(), "/");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/");
  });

  it("shows each meander as a card with its shape, Code and patterns", async () => {
    serveMeandersApi(3);

    await renderRoute(getRouter(), "/");

    const cards = await screen.findAllByTestId("meander-card");

    expect(cards).toHaveLength(3);

    const [first, second] = cards.map((card) => within(card));

    expect(first?.getByText("1 × 1")).toBeDefined();
    expect(first?.getByText("Hardcoded")).toBeDefined();
    expect(first?.getByText("01x01y0000")).toBeDefined();
    expect(
      first?.getByRole("list", { name: "Pattern characteristics" }).textContent,
    ).toBe("Chain");
    expect(second?.queryByText("Hardcoded")).toBeNull();
  });

  it("opens on the grid, and switches to the list and back through the link", async () => {
    serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(
      screen.getByRole("button", { name: "Grid", pressed: true }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "List" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        view: "list",
      });
    });

    expect(
      screen.getByRole("button", { name: "List", pressed: true }),
    ).toBeDefined();
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        view: "grid",
      });
    });
  });

  it("opens on the list when the link names it, and ignores a view it does not know", async () => {
    serveMeandersApi(2);

    await renderRoute(getRouter(), "/?view=list");

    await expect(
      screen.findByRole("button", { name: "List", pressed: true }),
    ).resolves.toBeDefined();
  });

  it("says so when there are no meanders yet", async () => {
    serveMeandersApi(0);

    await renderRoute(getRouter(), "/");

    await expect(screen.findByTestId("gallery-empty")).resolves.toBeDefined();
    expect(screen.queryAllByTestId("meander-card")).toHaveLength(0);
  });

  it("shows why the load failed, and loads again when asked", async () => {
    const api = serveMeandersApi(2);
    api.fail("The database is down");

    await renderRoute(getRouter(), "/");

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

    await renderRoute(getRouter(), "/");

    const mounted = await screen.findAllByTestId("meander-card");

    expect(mounted.length).toBeGreaterThan(0);
    expect(mounted.length).toBeLessThan(25);
    expect(screen.getByText("500 meanders")).toBeDefined();
  });

  it("puts as many cards in a row as the width holds", async () => {
    serveMeandersApi(40);
    setViewportWidth(1280);

    await renderRoute(getRouter(), "/");

    const [row] = await screen.findAllByTestId("meander-gallery-row");

    expect(cardsIn(row)).toHaveLength(4);
  });

  it("puts one card in a row on a phone", async () => {
    serveMeandersApi(40);
    setViewportWidth(375);

    await renderRoute(getRouter(), "/");

    const [row] = await screen.findAllByTestId("meander-gallery-row");

    expect(cardsIn(row)).toHaveLength(1);
  });

  it("loads the next page as the last rows scroll into view", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");

    expect(api.requests).toHaveLength(1);

    scrollWindowTo(3300);

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests[1]).toMatchObject({ after: "47" });
  });

  it("shows why the next page failed, and reads it again when asked", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");
    api.fail("The database is down");
    scrollWindowTo(3300);

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toMatch(/The database is down/u);

    api.recover();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });

    expect(api.requests.at(-1)).toMatchObject({ after: "47" });
  });

  it("offers the shape fields and the catalog to sort by", async () => {
    serveMeandersApi(3);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");

    const options = within(screen.getByLabelText("Sort by")).getAllByRole(
      "option",
    );

    expect(options.map((option) => option.textContent)).toStrictEqual([
      "Default order",
      "Rows",
      "Columns",
      "Lattice",
      "Repeats",
      "Hardcoded",
      "Code",
      "Chain",
      "Junction count",
    ]);
  });

  // The mock API sorts like the real one, so the order of the cards shown proves
  // the page sends the sort and shows the answer in the order it came, not that
  // the API sorts correctly: that is the API's own end-to-end suite.
  it("puts the field picked in the link, asks the API for it, and shows the answer in order", async () => {
    const api = serveMeandersApi(6);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(codesShown()).toStrictEqual([
      "01x01y0000",
      "01x01y0001",
      "01x01y0002",
      "01x01y0003",
      "01x01y0004",
      "01x01y0005",
    ]);

    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: "rows" },
    });

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        direction: "asc",
        sort: "rows",
      });
    });
    await waitFor(() => {
      expect(codesShown().slice(0, 2)).toStrictEqual([
        "01x01y0000",
        "01x01y0005",
      ]);
    });

    expect(api.requests.at(-1)).toMatchObject({
      sort: { direction: "ASC", field: "rows" },
    });
  });

  it("flips the direction in the link and the request, and drops both with the default order", async () => {
    serveMeandersApi(6);
    const router = getRouter();

    await renderRoute(router, "/?sort=rows");
    await screen.findAllByTestId("meander-card");

    fireEvent.click(screen.getByRole("button", { name: "Sort descending" }));

    await waitFor(() => {
      expect(codesShown()[0]).toBe("01x01y0004");
    });

    expect({ ...router.state.location.search }).toStrictEqual({
      direction: "desc",
      sort: "rows",
    });

    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: "" },
    });

    await waitFor(() => {
      expect(codesShown()[0]).toBe("01x01y0000");
    });

    expect({ ...router.state.location.search }).toStrictEqual({});
  });

  it("opens sorted by a characteristic when the link names one, and pages in that sort", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?sort=junctionCount&direction=desc");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByDisplayValue("Junction count")).toBeDefined();

    scrollWindowTo(3300);

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests[1]).toMatchObject({
      after: "47",
      sort: { direction: "DESC", field: "junctionCount" },
    });
  });

  it("builds a nested filter, writing it to the link and narrowing the cards and the total", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("8 meanders")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    await setControl("Field", "junctionCount");
    await setControl("Operator", "gte");
    await setControl("Value", "3");

    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });

    expect(structuredClone(router.state.location.search.filter)).toStrictEqual({
      combinator: "and",
      rules: [{ field: "junctionCount", operator: "gte", value: 3 }],
    });
    expect(api.requests.at(-1)).toMatchObject({
      filter: {
        combinator: "AND",
        rules: [{ field: "junctionCount", numbers: [3], operator: "GTE" }],
      },
    });

    // Nested: and, too, either a chain or hardcoded.
    fireEvent.click(screen.getByRole("button", { name: "Add group" }));

    const group = await screen.findByRole("group", { name: "Filter group 2" });

    await setControl("Match", "or", within(group));
    await setControl("Field", "isChain", within(group));

    await waitFor(() => {
      expect(screen.getByText("2 meanders")).toBeDefined();
    });

    expect(codesShown()).toStrictEqual(["01x01y0003", "01x01y0006"]);
  });

  it("removes a rule, and the whole filter with the last one", async () => {
    serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    await setControl("Value", "9");

    await waitFor(() => {
      expect(screen.getByText("0 meanders")).toBeDefined();
    });

    fireEvent.click(await screen.findByRole("button", { name: "Remove rule" }));

    await waitFor(() => {
      expect(screen.getByText("8 meanders")).toBeDefined();
    });

    expect({ ...router.state.location.search }).toStrictEqual({});
  });

  it("shows each rule in force as a chip, and removes the rule with its chip", async () => {
    serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    await setControl("Field", "junctionCount");
    await setControl("Operator", "gte");
    await setControl("Value", "3");

    const chip = await screen.findByRole("button", {
      name: "Remove Junction count ≥ 3",
    });

    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });

    fireEvent.click(chip);

    await waitFor(() => {
      expect(screen.getByText("8 meanders")).toBeDefined();
    });

    expect(screen.queryByTestId("filter-chip-row")).toBeNull();
    expect({ ...router.state.location.search }).toStrictEqual({});
  });

  it("opens the builder in the surface the width suits", async () => {
    serveMeandersApi(3);
    setViewportWidth(375);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    expect(screen.getByRole("dialog").matches('[data-surface="sheet"]')).toBe(
      true,
    );
  });

  it("falls back to the default order when the link names a sort that is not a field", async () => {
    const api = serveMeandersApi(3);

    await renderRoute(getRouter(), "/?sort=nope&direction=desc");
    await screen.findAllByTestId("meander-card");

    expect(codesShown()).toStrictEqual([
      "01x01y0000",
      "01x01y0001",
      "01x01y0002",
    ]);
    expect(api.requests[0]?.sort).toBeUndefined();
    expect(screen.getByDisplayValue("Default order")).toBeDefined();
  });

  it("shows why the first page failed, whatever the sort", async () => {
    const api = serveMeandersApi(3);
    api.fail("The database is down");

    await renderRoute(getRouter(), "/?sort=rows");

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toMatch(/The database is down/u);
    expect(screen.queryAllByTestId("meander-card")).toHaveLength(0);
  });

  it("says it is loading while a new sort reads, keeping the cards up", async () => {
    serveMeandersApi(3, 150);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "rows" },
    });

    const status = await screen.findByRole("status");

    expect(status.textContent).toBe("Loading…");
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);

    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });
  });

  it("reads the filter from a shared link, shows it as chips and narrows the cards", async () => {
    const api = serveMeandersApi(8);
    const filter = {
      combinator: "and",
      rules: [
        { field: "junctionCount", operator: "gte", value: 3 },
        {
          combinator: "or",
          rules: [{ field: "isChain", operator: "is", value: true }],
        },
      ],
    };

    await renderRoute(
      getRouter(),
      `/?filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );

    await expect(
      screen.findByRole("button", { name: "Remove Junction count ≥ 3" }),
    ).resolves.toBeDefined();
    expect(
      screen.getByRole("button", { name: "Remove Chain is true" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Filter, 2 active" }),
    ).toBeDefined();
    expect(screen.getByText("2 meanders")).toBeDefined();
    expect(codesShown()).toStrictEqual(["01x01y0003", "01x01y0006"]);
    expect(api.requests[0]).toMatchObject({
      filter: {
        combinator: "AND",
        groups: [{ combinator: "OR" }],
        rules: [{ field: "junctionCount", numbers: [3], operator: "GTE" }],
      },
    });
  });

  it("opens the builder on the filter a link carries", async () => {
    serveMeandersApi(8);
    const filter = {
      combinator: "and",
      rules: [{ field: "junctionCount", operator: "between", value: [2, 3] }],
    };

    await renderRoute(
      getRouter(),
      `/?filter=${encodeURIComponent(JSON.stringify(filter))}`,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Filter, 1 active" }),
    );

    expect(screen.getByLabelText<HTMLSelectElement>("Operator").value).toBe(
      "between",
    );
    expect(screen.getByLabelText<HTMLInputElement>("From").value).toBe("2");
    expect(screen.getByLabelText<HTMLInputElement>("To").value).toBe("3");
  });

  it("leaves out a filter that is not a tree, and the rules the catalog cannot answer", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/?filter=%7Bnot-json");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("8 meanders")).toBeDefined();
    expect(api.requests[0]?.filter).toBeUndefined();

    const stale = {
      combinator: "and",
      rules: [{ field: "retired", operator: "eq", value: 1 }],
    };

    await renderRoute(
      getRouter(),
      `/?filter=${encodeURIComponent(JSON.stringify(stale))}`,
    );

    await waitFor(() => {
      expect(screen.getAllByText("8 meanders").length).toBeGreaterThan(0);
    });

    expect(api.requests.at(-1)?.filter).toBeUndefined();
    expect(screen.queryByTestId("filter-chip-row")).toBeNull();
  });

  it("adds and removes levels, keeping them in the link", async () => {
    serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("Not grouped")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Group cards" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        group: ["rowsColumns"],
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Add sub-group" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        group: ["rowsColumns", "lattice"],
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove group 1" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        group: ["lattice"],
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove group 1" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({});
    });
  });

  it("opens on the levels a shared link names, leaving out the unknown", async () => {
    serveMeandersApi(3);

    await renderRoute(
      getRouter(),
      '/?group=["isChain","nonsense","isChain","lattice"]',
    );

    await expect(screen.findByLabelText("Group 1 by")).resolves.toHaveProperty(
      "value",
      "isChain",
    );
    expect(screen.getByLabelText<HTMLSelectElement>("Group 2 by").value).toBe(
      "lattice",
    );
    expect(screen.queryByLabelText("Group 3 by")).toBeNull();
  });
});
