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

/** The drawing a card shows, as the Code its image carries, decoded. */
function drawingOf(position: number): string {
  const image = screen.getAllByRole("img")[position];

  return decodeURIComponent(image?.getAttribute("src") ?? "");
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

    const options = within(
      screen.getByRole("combobox", { name: "Sort by" }),
    ).getAllByRole("option");

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

    fireEvent.change(screen.getByRole("combobox", { name: "Sort by" }), {
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

    fireEvent.change(screen.getByRole("combobox", { name: "Sort by" }), {
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
    fireEvent.change(screen.getByRole("combobox", { name: "Sort by" }), {
      target: { value: "rows" },
    });

    const status = await screen.findByRole("status");

    expect(status.textContent).toBe("Loading…");
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);

    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });
  });

  it("asks for each drawing with its tile repeated 6 times, on the first page and the next", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/");

    const [image] = await screen.findAllByRole("img");
    const drawing = decodeURIComponent(image?.getAttribute("src") ?? "");

    expect(drawing).toContain('data-repeats="6"');

    scrollWindowTo(3300);

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests.map(({ repeats }) => repeats)).toStrictEqual([6, 6]);
  });

  it("changes the repeats from a labelled control, in the link, the request and the drawing", async () => {
    const api = serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    const control = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Repeats",
    });

    expect(control.value).toBe("6");

    fireEvent.change(control, { target: { value: "3" } });

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        repeats: 3,
      });
    });
    await waitFor(() => {
      expect(drawingOf(0)).toContain('data-repeats="3"');
    });

    expect(api.requests.at(-1)).toMatchObject({ repeats: 3 });
    expect(api.requests.at(-1)?.after).toBeUndefined();
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);
  });

  it("falls back to 6 repeats for a link that names none that is valid", async () => {
    const api = serveMeandersApi(2);

    await renderRoute(getRouter(), "/?repeats=99");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.repeats).toBe(6);
    expect(drawingOf(0)).toContain('data-repeats="6"');
  });

  it("falls back to 6 repeats for a link that names text", async () => {
    const api = serveMeandersApi(2);

    await renderRoute(getRouter(), "/?repeats=abc");
    await screen.findAllByTestId("meander-card");

    expect(api.requests[0]?.repeats).toBe(6);
    expect(
      screen.getByRole<HTMLSelectElement>("combobox", { name: "Repeats" })
        .value,
    ).toBe("6");
  });

  it("opens on the repeats the link names, and pages with them", async () => {
    const api = serveMeandersApi(100);

    await renderRoute(getRouter(), "/?repeats=2");
    await screen.findAllByTestId("meander-card");
    scrollWindowTo(3300);

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });

    expect(api.requests.map(({ repeats }) => repeats)).toStrictEqual([2, 2]);
  });
});
