import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../testing/meanders-api";
import { setViewportWidth } from "../../../testing/viewport";
import { getRouter } from "../../router";

/** The Codes of the cards on screen, in the order they appear. */
function codesShown(): string[] {
  return screen
    .getAllByTestId("meander-card")
    .map((card) => within(card).getByRole("code").textContent);
}

/**
 * Sets a control by label, commits it by leaving it, and waits for the link to carry it back.
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

/** A link to the gallery carrying a filter tree. */
function linkTo(filter: unknown): string {
  return `/?filter=${encodeURIComponent(JSON.stringify(filter))}`;
}

/** Opens the Filters surface, whichever kind the width gives. */
async function openFilters(name = "Filter"): Promise<HTMLElement> {
  fireEvent.click(await screen.findByRole("button", { name }));

  return screen.getByRole("dialog");
}

describe("gallery filters", () => {
  it("builds a nested filter, writing it to the link and narrowing the cards and the total", async () => {
    const api = serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("8 meanders")).toBeDefined();

    await openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    await commitControl("Field", "junctionCount");
    await commitControl("Operator", "gte");
    await commitControl("Value", "3");

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

    await commitControl("Match", "or", within(group));
    await commitControl("Field", "isChain", within(group));

    await waitFor(() => {
      expect(screen.getByText("2 meanders")).toBeDefined();
    });

    expect(codesShown()).toStrictEqual(["01x01y0003", "01x01y0006"]);
  });

  it("keeps focus on a control as its field and operator change", async () => {
    serveMeandersApi(8);

    await renderRoute(getRouter(), "/");
    await openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    const field = await screen.findByLabelText("Field");

    field.focus();
    await commitControl("Field", "junctionCount");

    expect(screen.getByLabelText("Field")).toBe(field);
    expect(globalThis.document.activeElement).toBe(field);
  });

  it("removes a rule, and the whole filter with the last one", async () => {
    serveMeandersApi(8);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");
    await openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    await commitControl("Field", "junctionCount");
    await commitControl("Value", "9");

    await waitFor(() => {
      expect(screen.getByText("0 meanders")).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove rule" }));

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
    await openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    await commitControl("Field", "junctionCount");
    await commitControl("Operator", "gte");
    await commitControl("Value", "3");

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

  it.each([
    [1280, "popover"],
    [1024, "popover"],
    [900, "drawer"],
    [768, "drawer"],
    [375, "sheet"],
  ])("opens the builder at %i pixels as a %s", async (width, kind) => {
    serveMeandersApi(3);
    setViewportWidth(width);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");

    const dialog = await openFilters();

    expect(dialog.matches(`[data-surface="${kind}"]`)).toBe(true);
  });

  it("moves focus into the builder, and gives it back to the button on Escape", async () => {
    serveMeandersApi(3);
    setViewportWidth(375);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");

    const button = await screen.findByRole("button", { name: "Filter" });
    const dialog = await openFilters();

    expect(dialog.contains(globalThis.document.activeElement)).toBe(true);

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(globalThis.document.activeElement).toBe(button);
  });

  it("leaves Escape to a select that is open in the builder", async () => {
    serveMeandersApi(3);

    await renderRoute(getRouter(), "/");
    await openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    fireEvent.keyDown(await screen.findByLabelText("Field"), {
      key: "Escape",
    });

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("stays open as the window resizes across a width, changing its surface", async () => {
    serveMeandersApi(3);

    await renderRoute(getRouter(), "/");
    await screen.findAllByTestId("meander-card");

    const dialog = await openFilters();

    expect(dialog.matches('[data-surface="popover"]')).toBe(true);

    act(() => {
      setViewportWidth(375);
      globalThis.dispatchEvent(new Event("resize"));
    });

    expect(screen.getByRole("dialog")).toBe(dialog);
    expect(dialog.matches('[data-surface="sheet"]')).toBe(true);
  });

  it("reads the filter from a shared link, shows it as chips and narrows the cards", async () => {
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

    await renderRoute(
      getRouter(),
      linkTo({
        combinator: "and",
        rules: [{ field: "junctionCount", operator: "between", value: [2, 3] }],
      }),
    );
    await openFilters("Filter, 1 active");

    expect(screen.getByLabelText<HTMLSelectElement>("Operator").value).toBe(
      "between",
    );
    expect(screen.getByLabelText<HTMLInputElement>("From").value).toBe("2");
    expect(screen.getByLabelText<HTMLInputElement>("To").value).toBe("3");
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
        rules: [
          { field: "junctionCount", numbers: [1, 4], operator: "BETWEEN" },
          { field: "junctionCount", numbers: [3], operator: "GTE" },
        ],
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
    expect(api.requests.at(-1)?.filter).toBeUndefined();
    expect(screen.queryByTestId("filter-chip-row")).toBeNull();
  });

  it("opens on every meander when the link's filter is not a tree", async () => {
    const api = serveMeandersApi(8);

    await renderRoute(getRouter(), "/?filter=%7Bnot-json");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("8 meanders")).toBeDefined();
    expect(api.requests[0]?.filter).toBeUndefined();
  });
});
