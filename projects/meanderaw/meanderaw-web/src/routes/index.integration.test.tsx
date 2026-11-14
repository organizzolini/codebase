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
    ).toBe("isChain");
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

    const options = within(screen.getByRole("combobox")).getAllByRole("option");

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

  it("sorts by the field picked, in the link and in the order of the cards", async () => {
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

    fireEvent.change(screen.getByRole("combobox"), {
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

  it("flips the direction of the sort, and drops the sort with the default order", async () => {
    serveMeandersApi(6);
    const router = getRouter();

    await renderRoute(router, "/?sort=rows");
    await screen.findAllByTestId("meander-card");

    fireEvent.click(screen.getByRole("button", { name: "Ascending" }));

    await waitFor(() => {
      expect(codesShown()[0]).toBe("01x01y0004");
    });

    expect({ ...router.state.location.search }).toStrictEqual({
      direction: "desc",
      sort: "rows",
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });

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
});
