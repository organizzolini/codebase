import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { graphqlMockServer } from "@codebase/interface/testing";
import { renderRoute } from "@codebase/testing/react";

import { mockTextReaderQuery } from "../graphql/generated/mocks";
import { getRouter } from "../router";

import { Route } from "./history";

const HISTORY_KEY = "lexico-lookup-history";
const LOOKUP = {
  definition: "arms",
  form: "nominative plural",
  kind: "lookup",
  line: 2,
  recordedAt: 3,
  slug: "vergil-aeneid-1",
  title: "Aeneid, Book 1",
  token: 0,
  word: "Arma",
};
const SEARCH = { kind: "search", query: "amo", recordedAt: 2 };

describe("history", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("shows what was recently looked up and searched on the history page", async () => {
    globalThis.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([LOOKUP, SEARCH]),
    );

    await renderRoute(getRouter(), "/history");

    const recent = await screen.findByTestId("recent-history");

    expect(
      within(recent).getByRole("heading", { name: "Recent" }),
    ).toBeDefined();
    expect(within(recent).getByText("Arma")).toBeDefined();
    expect(within(recent).getByText("Aeneid, Book 1")).toBeDefined();
    expect(within(recent).getByText("amo")).toBeDefined();
  });

  it("says so while there is no history", async () => {
    await renderRoute(getRouter(), "/history");

    await screen.findByTestId("history-empty");

    expect(screen.queryByTestId("recent-history")).toBeNull();
  });

  it("reruns a recent search when it is clicked", async () => {
    globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify([SEARCH]));
    const router = getRouter();
    await renderRoute(router, "/history");

    fireEvent.click(await screen.findByRole("button", { name: /^amo/u }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ query: "amo" });
    });
  });

  it("opens a recent lookup at its line in its text", async () => {
    graphqlMockServer.use(
      mockTextReaderQuery(() => HttpResponse.json({ data: { text: null } })),
    );
    globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify([LOOKUP]));
    const router = getRouter();
    await renderRoute(router, "/history");

    fireEvent.click(await screen.findByRole("button", { name: /^Arma/u }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/texts/vergil-aeneid-1");
    });

    expect(router.state.location.search).toMatchObject({ line: 2 });
  });

  it("clears the history", async () => {
    globalThis.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([LOOKUP, SEARCH]),
    );
    await renderRoute(getRouter(), "/history");

    fireEvent.click(
      await screen.findByRole("button", { name: "Clear history" }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId("recent-history")).toBeNull();
    });

    expect(globalThis.localStorage.getItem(HISTORY_KEY)).toBe("[]");
  });

  it("renders its page", async () => {
    await renderRoute(getRouter(), "/history");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/history");
  });
});
