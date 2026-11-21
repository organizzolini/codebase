import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../../testing/meanders-api";
import { getRouter } from "../../../router";

/**
 * Time a builder test may take.
 */
const BUILDER_TEST = { timeout: 30_000 };

/** Adds a filter on the Junction count characteristic, by an operator. */
async function addJunctionFilter(
  operator: RegExp,
  value: string,
): Promise<void> {
  fireEvent.click(await screen.findByRole("button", { name: /^Filter(,|$)/u }));
  fireEvent.change(await screen.findByRole("combobox"), {
    target: { value: "junction" },
  });
  await pickOption(/Junction count/u);
  await pickOption(operator);

  // The value is an input in the chip's own popover.
  const box = await screen.findByRole(
    "spinbutton",
    { name: "Junction count" },
    { timeout: 10_000 },
  );

  fireEvent.change(box, { target: { value } });
  fireEvent.keyDown(box, { key: "Enter" });
}

/** What the pager says, whichever surface hides the page from assistive technology. */
function pages(): string {
  return screen
    .getByRole("group", { hidden: true, name: "Pages" })
    .textContent.replace(/^Page/u, "");
}

/** Picks an option from whichever list is open. */
async function pickOption(name: RegExp | string): Promise<void> {
  fireEvent.click(
    await screen.findByRole("option", { name }, { timeout: 10_000 }),
  );
}

describe("gallery filters", () => {
  it(
    "adds a filter through the builder, in the link and the request, and counts it on the Filter button",
    async () => {
      const api = serveMeandersApi(8);
      const router = getRouter();

      await renderRoute(router, "/?group=%5B%5D");
      await screen.findAllByTestId("meander-card");

      expect(pages()).toBe("1 to 8 of 8");

      await addJunctionFilter(/is at least/u, "3");

      await waitFor(() => {
        expect(pages()).toBe("1 to 4 of 4");
      }, BUILDER_TEST);

      expect(
        structuredClone(router.state.location.search.filter),
      ).toStrictEqual({
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
        rules: [{ field: "rows", numbers: [4], operator: "EQ" }],
      });
      expect(
        screen.getByRole("button", { hidden: true, name: "Filter, 1 active" }),
      ).toBeDefined();
    },
    BUILDER_TEST.timeout,
  );

  it("opens on the filter a shared link names, as a chip for each rule beside rows and repeats", async () => {
    serveMeandersApi(8);

    await renderRoute(
      getRouter(),
      `/?group=%5B%5D&filter=${encodeURIComponent(
        JSON.stringify({
          combinator: "or",
          rules: [
            { field: "isChain", operator: "is", value: true },
            { field: "junctionCount", operator: "gte", value: 4 },
          ],
        }),
      )}`,
    );
    await screen.findAllByTestId("meander-card");

    const chips = screen.getByRole("group", { name: "Filter" });

    for (const name of ["Rows", "Repeats", "Chain", "Junction count"]) {
      expect(chips.textContent).toContain(name);
    }
  });

  it("keeps the rows rule ANDed with a tree whose own combinator is any", async () => {
    const api = serveMeandersApi(8, 0, (index) => (index % 4) + 2);

    await renderRoute(
      getRouter(),
      `/?group=%5B%5D&filter=${encodeURIComponent(
        JSON.stringify({
          combinator: "or",
          rules: [
            { field: "isChain", operator: "is", value: true },
            { field: "junctionCount", operator: "gte", value: 4 },
          ],
        }),
      )}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.filter).toMatchObject({
      combinator: "AND",
      groups: [{ combinator: "OR" }],
      rules: [{ field: "rows", numbers: [4], operator: "EQ" }],
    });
  });

  it("drops rules on rows and repeats from a link's tree, which the link holds apart", async () => {
    const api = serveMeandersApi(4);

    await renderRoute(
      getRouter(),
      `/?group=%5B%5D&filter=${encodeURIComponent(
        JSON.stringify({
          combinator: "and",
          rules: [
            { field: "rows", operator: "eq", value: 2 },
            { field: "repeats", operator: "eq", value: 3 },
          ],
        }),
      )}`,
    );
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.filter).toStrictEqual({
      combinator: "AND",
      rules: [{ field: "rows", numbers: [4], operator: "EQ" }],
    });
  });

  it(
    "gives rows and repeats no way to be removed, by their menu",
    async () => {
      serveMeandersApi(8, 0, (index) => (index % 4) + 2);
      const router = getRouter();

      await renderRoute(
        router,
        `/?group=%5B%5D&repeats=6&rows=${encodeURIComponent('{"operator":"gte","value":3}')}`,
      );
      await screen.findAllByTestId("meander-card");

      const chips = screen.getByRole("group", { name: "Filter" });

      fireEvent.click(
        within(chips).getByRole("button", { name: "Rows filter options" }),
      );
      await screen.findByRole("menu");

      // Removing it is refused, so the chip is still there.
      fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

      expect(chips.textContent).toContain("Rows");
      expect(router.state.location.search.rows).toStrictEqual({
        operator: "gte",
        value: 3,
      });

      expect(router.state.location.search.repeats).toBe(6);
    },
    BUILDER_TEST.timeout,
  );
});
