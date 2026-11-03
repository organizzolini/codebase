import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createFailingEventsDatabase,
  createTestEventsDatabase,
  createTestSqlExecutor,
} from "../../../testing/events-database";
import { renderRoute } from "../../../testing/render-route";
import { createEventsDatabase } from "../events-calendar/events-database.utilities";

import { NightSkyBackdropMount } from "./night-sky-backdrop-mount";

import type { EventsDatabase } from "../events-calendar/events-database.types";

/**
 * The seeded database, except that its night sky read fails as an unreadable
 * table does, or meets a star row the schema rejects.
 */
function createBrokenSkyDatabase(
  mode: "failing" | "malformed",
): EventsDatabase {
  if (mode === "malformed") {
    return createEventsDatabase(
      createTestSqlExecutor({
        extraSql: "insert into star values (1, 1, 1, 'bright', 0);",
      }),
    );
  }

  const failing = createFailingEventsDatabase(
    new Error("The table could not be read"),
  ).database;

  return {
    ...createTestEventsDatabase(),
    findNightSky: async () => failing.findNightSky(),
  };
}

vi.mock(import("../../router"), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    getRouter: () => {
      const router = original.getRouter();

      router.update({
        ...router.options,
        InnerWrap: ({ children }) => (
          <>
            <NightSkyBackdropMount />
            {children}
          </>
        ),
      });

      return router;
    },
  };
});

describe("night sky backdrop load failures", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each(["failing", "malformed"] as const)(
    "draws nothing and reports a night sky read that is %s",
    async (mode) => {
      const report = vi.spyOn(console, "error").mockImplementation(() => {});

      await renderRoute("/?date=2026-03-01", {
        eventsDatabase: createBrokenSkyDatabase(mode),
      });
      await screen.findByRole("grid", { name: "March 2026" });

      await waitFor(() => {
        expect(report).toHaveBeenCalledWith(
          "The night sky could not be loaded",
          expect.anything(),
        );
      });

      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("svg"),
      ).toBeNull();
    },
  );
});
