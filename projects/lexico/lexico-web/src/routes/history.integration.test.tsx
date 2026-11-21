import { fireEvent, screen, waitFor } from "@testing-library/react";
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
const TEXT = {
  authorName: "Julius Caesar",
  kind: "text",
  recordedAt: 1,
  slug: "text-1",
  title: "De Bello Gallico",
};
const SEARCH = { kind: "search", query: "amo", recordedAt: 2 };

describe("history", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("shows every kind of interaction as a card", async () => {
    globalThis.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([LOOKUP, SEARCH, TEXT]),
    );

    await renderRoute(getRouter(), "/history");

    await expect(screen.findAllByTestId("history-card")).resolves.toHaveLength(
      3,
    );
    expect(screen.getByText("Arma")).toBeDefined();
    expect(screen.getByText(/Aeneid, Book 1/u)).toBeDefined();
    expect(screen.getByText("Searched for amo")).toBeDefined();
    expect(
      screen.getByText("Opened De Bello Gallico by Julius Caesar"),
    ).toBeDefined();
  });

  it("opens a recorded text from its card", async () => {
    graphqlMockServer.use(
      mockTextReaderQuery(() => HttpResponse.json({ data: { text: null } })),
    );
    globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify([TEXT]));
    const router = getRouter();
    await renderRoute(router, "/history");

    fireEvent.click(
      await screen.findByRole("button", { name: "Open De Bello Gallico" }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/texts/text-1");
    });
  });

  it("reruns a recent search when it is clicked", async () => {
    globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify([SEARCH]));
    const router = getRouter();
    await renderRoute(router, "/history");

    fireEvent.click(await screen.findByRole("button", { name: "Open amo" }));

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

    fireEvent.click(await screen.findByRole("button", { name: "Open Arma" }));

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
      expect(screen.queryByTestId("history-card")).toBeNull();
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
