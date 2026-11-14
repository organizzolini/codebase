import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../testing/meanders-api";
import { getRouter } from "../router";

import { Route } from "./index";

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
});
