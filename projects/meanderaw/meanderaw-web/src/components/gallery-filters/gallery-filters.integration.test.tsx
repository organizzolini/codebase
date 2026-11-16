import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../testing/meanders-api";
import { setViewportWidth } from "../../../testing/viewport";
import { getRouter } from "../../router";
import { DEFAULT_ROWS_FILTER } from "../gallery-filter-builder/gallery-filter-builder.constants";

const ROWS_REQUEST = { field: "rows", numbers: [4], operator: "EQ" };
const ONLY_ROWS_REQUEST = { combinator: "AND", rules: [ROWS_REQUEST] };

/**
 * Adds a filter through the popup: search for the attribute, pick it, set
 * the operator and value, and press Add filter.
 */
async function addFilter(
  search: string,
  attribute: RegExp,
  operator?: string,
  value?: string,
): Promise<void> {
  const popup = within(await openFilters());

  fireEvent.change(popup.getByRole("combobox", { name: "Search attributes" }), {
    target: { value: search },
  });
  fireEvent.click(popup.getByRole("option", { name: attribute }));

  if (operator !== undefined) {
    fireEvent.change(popup.getByLabelText("Operator"), {
      target: { value: operator },
    });
  }

  if (value !== undefined) {
    const box = popup.getByLabelText("Value");

    fireEvent.change(box, { target: { value } });
    fireEvent.blur(box);
  }

  fireEvent.click(popup.getByRole("button", { name: "Add filter" }));
}

/** The Codes of the cards on screen, in the order they appear. */
function codesShown(): string[] {
  return screen
    .getAllByTestId("meander-card")
    .map((card) => within(card).getByRole("code").textContent);
}

/**
 * Sets a control by its label, commits it as a user does by leaving it, and
 * waits until it shows the value.
 */
async function commitControl(
  label: string,
  value: string,
  scope: Pick<typeof screen, "findByLabelText"> = screen,
): Promise<void> {
  const control = await scope.findByLabelText<HTMLInputElement>(label);

  fireEvent.change(control, { target: { value } });
  fireEvent.blur(control);

  await waitFor(() => {
    expect(control.value).toBe(value);
  });
}

/** A link to the gallery carrying a filter tree, and perhaps a rows rule. */
function linkTo(filter: unknown, rows?: unknown): string {
  const parameters = [`filter=${encodeURIComponent(JSON.stringify(filter))}`];

  if (rows !== undefined) {
    parameters.push(`rows=${encodeURIComponent(JSON.stringify(rows))}`);
  }

  return `/?${parameters.join("&")}`;
}

/** Opens the Filter popup. */
async function openFilters(): Promise<HTMLElement> {
  fireEvent.click(await screen.findByRole("button", { name: /^Filter(,|$)/u }));

  return screen.getByRole("dialog");
}

/** The filter pills on screen, by their attribute. */
function pillsShown(): (null | string)[] {
  return within(screen.getByTestId("filter-pill-row"))
    .getAllByTestId("filter-pill")
    .map((pill) => within(pill).getByRole("group").getAttribute("aria-label"));
}

describe("gallery filters", () => {
  it("adds a filter through the popup: search, attribute, operator, value, and a pill appears", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("8 meanders")).toBeDefined();

    await addFilter("junction", /Junction count/u, "gte", "3");

    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(pillsShown()).toStrictEqual([
      "Filter Rows",
      "Filter Junction count",
    ]);
    expect(
      screen.getByLabelText<HTMLInputElement>("Junction count Value").value,
    ).toBe("3");
    expect(structuredClone(router.state.location.search.filter)).toStrictEqual({
      combinator: "and",
      rules: [{ field: "junctionCount", operator: "gte", value: 3 }],
    });
    expect(api.requests.at(-1)?.filter).toStrictEqual({
      combinator: "AND",
      groups: [
        {
          combinator: "AND",
          rules: [{ field: "junctionCount", numbers: [3], operator: "GTE" }],
        },
      ],
      rules: [ROWS_REQUEST],
    });
  });

  it("finds an attribute by searching, and picks one with the arrow keys and Enter", async () => {
    serveMeandersApi(8);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");

    const popup = within(await openFilters());
    const search = popup.getByRole("combobox", { name: "Search attributes" });

    expect(globalThis.document.activeElement).toBe(search);

    fireEvent.change(search, { target: { value: "ch" } });

    expect(popup.getAllByRole("option").length).toBeGreaterThan(0);

    fireEvent.change(search, { target: { value: "zzz" } });

    expect(popup.getByText("No attributes match.")).toBeDefined();

    fireEvent.change(search, { target: { value: "" } });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "Enter" });

    expect(popup.getByText("How many columns the meander has")).toBeDefined();
  });

  it("edits a pill's operator and value in place, reading the cards and total again", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    await addFilter("junction", /Junction count/u, "gte", "3");
    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });

    await commitControl("Junction count Value", "4");

    await waitFor(() => {
      expect(screen.getByText("2 meanders")).toBeDefined();
    });

    expect(codesShown()).toStrictEqual(["01x01y0003", "01x01y0007"]);

    await commitControl("Junction count operator", "lt");

    await waitFor(() => {
      expect(screen.getByText("6 meanders")).toBeDefined();
    });

    expect(structuredClone(router.state.location.search.filter)).toStrictEqual({
      combinator: "and",
      rules: [{ field: "junctionCount", operator: "lt", value: 4 }],
    });
    expect(api.requests.at(-1)?.filter).toMatchObject({
      groups: [
        { rules: [{ field: "junctionCount", numbers: [4], operator: "LT" }] },
      ],
    });
  });

  it("removes a pill with its ×, and the filter from the address with the last one", async () => {
    serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    await addFilter("junction", /Junction count/u, "gte", "3");
    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Junction count filter" }),
    );

    await waitFor(() => {
      expect(screen.getByText("8 meanders")).toBeDefined();
    });

    expect(pillsShown()).toStrictEqual(["Filter Rows"]);
    expect(router.state.location.search.filter).toBeUndefined();
  });

  it("matches all or any of the pills, the rows rule applying either way", async () => {
    const api = serveMeandersApi(8);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");
    await addFilter("junction", /Junction count/u, "gte", "3");
    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });
    await addFilter("chain", /Chain/u);
    await waitFor(() => {
      expect(screen.getByText("2 meanders")).toBeDefined();
    });

    expect(codesShown()).toStrictEqual(["01x01y0003", "01x01y0006"]);

    await commitControl("Match", "or");

    await waitFor(() => {
      expect(screen.getByText("5 meanders")).toBeDefined();
    });

    expect(api.requests.at(-1)?.filter).toMatchObject({
      combinator: "AND",
      groups: [{ combinator: "OR" }],
      rules: [ROWS_REQUEST],
    });
  });

  it("applies rows = 4 on the first load, as a pill with no remove button, and says so in the address", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.filter).toStrictEqual(ONLY_ROWS_REQUEST);
    expect(screen.getByLabelText<HTMLInputElement>("Rows Value").value).toBe(
      "4",
    );
    expect(screen.queryByRole("button", { name: /Remove Rows/u })).toBeNull();

    await waitFor(() => {
      expect(structuredClone(router.state.location.search.rows)).toStrictEqual({
        operator: "eq",
        value: 4,
      });
    });
  });

  it("narrows the cards and the total to the rows rule, and lets its operator and value change in place", async () => {
    const api = serveMeandersApi(8, 0, (index) => (index % 4) + 2);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("2 meanders")).toBeDefined();
    expect(codesShown()).toStrictEqual(["01x01y0002", "01x01y0006"]);

    await commitControl("Rows operator", "gte");

    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });

    await commitControl("Rows Value", "5");

    await waitFor(() => {
      expect(screen.getByText("2 meanders")).toBeDefined();
    });

    expect(codesShown()).toStrictEqual(["01x01y0003", "01x01y0007"]);
    expect(structuredClone(router.state.location.search.rows)).toStrictEqual({
      operator: "gte",
      value: 5,
    });
    expect(api.requests.at(-1)?.filter).toStrictEqual({
      combinator: "AND",
      rules: [{ field: "rows", numbers: [5], operator: "GTE" }],
    });

    await commitControl("Rows operator", "between");
    await commitControl("Rows From", "3");
    await commitControl("Rows To", "4");

    await waitFor(() => {
      expect(screen.getByText("4 meanders")).toBeDefined();
    });
  });

  it("keeps the rows rule ANDed with a tree whose own combinator is any", async () => {
    const api = serveMeandersApi(8, 0, (index) => (index % 4) + 2);

    await renderRoute(
      getRouter(),
      linkTo({
        combinator: "or",
        rules: [
          { field: "isChain", operator: "is", value: true },
          { field: "junctionCount", operator: "gte", value: 4 },
        ],
      }),
    );
    await screen.findAllByTestId("meander-card");

    // rows = 4 holds for indices 2 and 6; of these only 6 is a chain.
    expect(codesShown()).toStrictEqual(["01x01y0006"]);
    expect(api.requests[0]?.filter).toMatchObject({
      combinator: "AND",
      groups: [{ combinator: "OR" }],
      rules: [ROWS_REQUEST],
    });
  });

  it("resets to rows = 4, with no other filter, when cleared", async () => {
    serveMeandersApi(8, 0, (index) => (index % 4) + 2);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    await commitControl("Rows Value", "5");
    await waitFor(() => {
      expect(structuredClone(router.state.location.search.rows)).toStrictEqual({
        operator: "eq",
        value: 5,
      });
    });
    await addFilter("chain", /Chain/u);
    await waitFor(() => {
      expect(router.state.location.search.filter).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(router.state.location.search.filter).toBeUndefined();
    });

    expect(structuredClone(router.state.location.search.rows)).toStrictEqual({
      operator: "eq",
      value: 4,
    });
    expect(screen.getByLabelText<HTMLInputElement>("Rows Value").value).toBe(
      "4",
    );
  });

  it("opens the popup at every width, small, and gives focus back to the button on Escape", async () => {
    for (const width of [1280, 900, 375]) {
      serveMeandersApi(3);
      setViewportWidth(width);

      const { unmount } = await renderRoute(getRouter(), "/");

      await screen.findAllByTestId("meander-card");

      const button = await screen.findByRole("button", { name: "Filter" });
      const dialog = await openFilters();

      expect(dialog.contains(globalThis.document.activeElement)).toBe(true);

      fireEvent.keyDown(dialog, { key: "Escape" });

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(globalThis.document.activeElement).toBe(button);

      unmount();
    }
  });

  it("shows a shared link's nested tree as parenthesized pills, editable in place", async () => {
    const api = serveMeandersApi(8);

    await renderRoute(
      getRouter(),
      linkTo({
        combinator: "and",
        rules: [
          { field: "junctionCount", operator: "gte", value: 3 },
          {
            combinator: "or",
            rules: [{ field: "isChain", operator: "is", value: true }],
          },
        ],
      }),
    );

    await expect(
      screen.findByRole("group", { name: "Filter group 2" }),
    ).resolves.toBeDefined();
    expect(screen.getByLabelText("Chain Value")).toBeDefined();
    expect(screen.getByText("2 meanders")).toBeDefined();
    expect(codesShown()).toStrictEqual(["01x01y0003", "01x01y0006"]);
    expect(api.requests[0]?.filter).toMatchObject({
      combinator: "AND",
      groups: [
        {
          combinator: "AND",
          groups: [{ combinator: "OR" }],
          rules: [{ field: "junctionCount", numbers: [3], operator: "GTE" }],
        },
      ],
      rules: [ROWS_REQUEST],
    });

    await commitControl("Filter group 2 match", "and");
    await commitControl("Chain Value", "false");

    await waitFor(() => {
      expect(screen.getByText("2 meanders")).toBeDefined();
    });
  });

  it("replaces a link's rules the catalog cannot answer, in the address as well as the page", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();
    const kept = { field: "junctionCount", operator: "gte", value: 3 };

    await renderRoute(
      router,
      linkTo({
        combinator: "and",
        rules: [
          { field: "retired", operator: "eq", value: 1 },
          { field: "rows", operator: "eq", value: 1.5 },
          { field: "junctionCount", operator: "between", value: [4, 1] },
          kept,
        ],
      }),
    );

    await waitFor(() => {
      expect(
        structuredClone(router.state.location.search.filter),
      ).toStrictEqual({
        combinator: "and",
        rules: [
          { field: "junctionCount", operator: "between", value: [1, 4] },
          kept,
        ],
      });
    });

    expect(api.requests[0]).toMatchObject({
      filter: {
        groups: [
          {
            rules: [
              { field: "junctionCount", numbers: [1, 4], operator: "BETWEEN" },
              { field: "junctionCount", numbers: [3], operator: "GTE" },
            ],
          },
        ],
        rules: [ROWS_REQUEST],
      },
    });
  });

  it("takes the filter off the address when nothing in it can be answered", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(
      router,
      linkTo({
        combinator: "and",
        rules: [{ field: "retired", operator: "eq", value: 1 }],
      }),
    );

    await waitFor(() => {
      expect(router.state.location.search.filter).toBeUndefined();
    });

    expect(screen.getByText("8 meanders")).toBeDefined();
    expect(api.requests.at(-1)?.filter).toStrictEqual(ONLY_ROWS_REQUEST);
    expect(pillsShown()).toStrictEqual(["Filter Rows"]);
  });

  it("opens on every meander when the link's filter is not a tree", async () => {
    const api = serveMeandersApi(8);

    await renderRoute(getRouter(), "/?filter=%7Bnot-json");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("8 meanders")).toBeDefined();
    expect(api.requests[0]?.filter).toStrictEqual(ONLY_ROWS_REQUEST);
  });

  it("adds rows = 4 to a shared link that has filters but no rows rule, and keeps one that it has", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();
    const filter = {
      combinator: "and",
      rules: [{ field: "junctionCount", operator: "gte", value: 3 }],
    };

    await renderRoute(router, linkTo(filter));
    await screen.findAllByTestId("meander-card");

    await waitFor(() => {
      expect(structuredClone(router.state.location.search.rows)).toStrictEqual({
        operator: "eq",
        value: 4,
      });
    });

    expect(api.requests[0]?.filter).toMatchObject({ rules: [ROWS_REQUEST] });

    await renderRoute(
      getRouter(),
      linkTo(filter, { operator: "gt", value: 2 }),
    );

    await waitFor(() => {
      expect(api.requests.at(-1)?.filter?.rules?.[0]).toStrictEqual({
        field: "rows",
        numbers: [2],
        operator: "GT",
      });
    });
  });

  it("replaces a link's rows rule that is not a whole-number comparison with rows = 4, in the address too", async () => {
    serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(
      router,
      linkTo({ combinator: "and", rules: [] }, { operator: "eq", value: 1.5 }),
    );

    await waitFor(() => {
      expect(structuredClone(router.state.location.search.rows)).toStrictEqual(
        DEFAULT_ROWS_FILTER,
      );
    });
  });
});
