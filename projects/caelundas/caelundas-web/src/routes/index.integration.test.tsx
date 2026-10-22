import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../testing/events-database";
import { renderRoute } from "../../testing/render-route";
import { UnsupportedBrowserError } from "../lib/events-database/events-database.errors";

import { Route } from "./index";

import type { EventsDatabase } from "../lib/events-database/events-database.types";

/**
 * A database whose every read fails with the error given, until `recover`
 * hands reads back to the seeded database.
 */
function createFailingEventsDatabase(error: Error): {
  database: EventsDatabase;
  recover: () => void;
} {
  const seeded = createTestEventsDatabase();
  let failing = true;

  return {
    database: {
      describeDataset: async () =>
        failing ? Promise.reject(error) : seeded.describeDataset(),
      findEvents: async (query) =>
        failing ? Promise.reject(error) : seeded.findEvents(query),
    },
    recover: () => {
      failing = false;
    },
  };
}

describe("index", () => {
  it("renders its page", async () => {
    await renderRoute("/");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/");
  });

  it("shows the requested month as a grid under one toolbar row", async () => {
    await renderRoute("/?date=2026-03-01");

    const grid = await screen.findByRole("grid", { name: "March 2026" });
    const toolbar = screen.getByTestId("calendar-toolbar");

    expect(grid).toBeDefined();
    expect(
      within(toolbar).getByRole("button", { name: /Next/u }),
    ).toBeDefined();
    expect(
      within(within(toolbar).getByRole("group", { name: "View" })).getByRole(
        "button",
        { name: "Month", pressed: true },
      ),
    ).toBeDefined();
  });

  it("shows each event at its time in the observer's zone", async () => {
    await renderRoute("/?date=2026-03-01");

    const event = await screen.findByRole("button", {
      name: /^Mars Conjunct Venus, 10:20\sAM/u,
    });

    expect(
      within(event).getByText(
        "Planet / Mars; Planet / Venus; Type / Aspect / Major Aspect / Conjunct. Instant",
      ),
    ).toBeDefined();
  });

  it("tells a span apart from an instant by its derived duration", async () => {
    await renderRoute("/?date=2026-03-01");

    const [span] = await screen.findAllByRole("button", {
      name: /^Mercury Retrograde/u,
    });

    expect(span).toBeDefined();
    expect(
      within(span ?? document.body).getByText(
        "Planet / Mercury; Type / Retrograde. 22 days, 12 hours, 44 minutes",
      ),
    ).toBeDefined();
  });

  it("moves to the next month and reads its events", async () => {
    await renderRoute("/?date=2026-03-01");

    const toolbar = await screen.findByTestId("calendar-toolbar");

    fireEvent.click(within(toolbar).getByRole("button", { name: /Next/u }));

    await expect(
      screen.findByRole("grid", { name: "April 2026" }),
    ).resolves.toBeDefined();
    await expect(
      screen.findByRole("button", { name: /^Mars Square Saturn/u }),
    ).resolves.toBeDefined();
  });

  it("offers the covered dates for a month outside the data", async () => {
    await renderRoute("/?date=2025-01-01");

    await screen.findByRole("grid", { name: "January 2025" });

    expect(screen.getByText("Outside the data")).toBeDefined();
    expect(
      screen.getByText("Events run from Feb 26, 2026 to Jun 21, 2026."),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Go to Feb 26, 2026" }));

    await expect(
      screen.findByRole("grid", { name: "February 2026" }),
    ).resolves.toBeDefined();
    expect(screen.queryByText("Outside the data")).toBeNull();
  });

  it("offers the last covered day for a month after the data", async () => {
    await renderRoute("/?date=2030-01-01");

    await screen.findByRole("grid", { name: "January 2030" });

    fireEvent.click(screen.getByRole("button", { name: "Go to Jun 21, 2026" }));

    await expect(
      screen.findByRole("button", { name: /^Sun Ingress Cancer/u }),
    ).resolves.toBeDefined();
  });

  it("says when a month inside the data holds no events", async () => {
    await renderRoute("/?date=2026-05-01");

    await screen.findByRole("grid", { name: "May 2026" });

    expect(screen.getByText("No events this month")).toBeDefined();
    expect(screen.queryByText("Outside the data")).toBeNull();
  });

  it("shows a skeleton while the database loads", async () => {
    await renderRoute("/?date=2026-03-01", {
      eventsDatabase: {
        describeDataset: async () => new Promise(() => {}),
        findEvents: async () => new Promise(() => {}),
      },
      waitForLoad: false,
    });

    await expect(
      screen.findByRole("status", { name: "Loading events" }),
    ).resolves.toBeDefined();
  });

  it("shows an error that retries when the database fails", async () => {
    const { database, recover } = createFailingEventsDatabase(
      new Error("The events database answered 404"),
    );

    await renderRoute("/?date=2026-03-01", { eventsDatabase: database });

    await expect(
      screen.findByText("The events could not be loaded"),
    ).resolves.toBeDefined();

    recover();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it("explains a browser without WebAssembly or Workers", async () => {
    const { database } = createFailingEventsDatabase(
      new UnsupportedBrowserError(),
    );

    await renderRoute("/?date=2026-03-01", { eventsDatabase: database });

    await expect(
      screen.findByText("This browser cannot run the calendar"),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("opens on today when the date in the link is not a date", async () => {
    await renderRoute("/?date=2026-02-30");

    const today = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    await expect(
      screen.findByRole("grid", { name: today }),
    ).resolves.toBeDefined();
  });

  it("says when the database holds no events at all", async () => {
    await renderRoute("/?date=2026-03-01", {
      eventsDatabase: createTestEventsDatabase({ empty: true }),
    });

    await screen.findByRole("grid", { name: "March 2026" });

    expect(screen.getByText("No events yet")).toBeDefined();
    expect(
      screen.queryAllByRole("button", { name: /Conjunct|Ingress/u }),
    ).toHaveLength(0);
  });
});
