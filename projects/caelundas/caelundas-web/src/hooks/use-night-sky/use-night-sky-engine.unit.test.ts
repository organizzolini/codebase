import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  createFailingEventsDatabase,
  createTestEventsDatabase,
} from "../../../testing/events-database";

import { useNightSkyEngine } from "./use-night-sky-engine";

import type { EventsDatabase } from "../../components/events-calendar/events-database.types";

/**
 * The database the router's context hands the hook, which each test sets.
 */
const context = vi.hoisted(() => ({
  eventsDatabase: undefined as EventsDatabase | undefined,
}));

vi.mock(import("@tanstack/react-router"), () => ({
  useRouter: (() => ({ options: { context } })) as never,
}));

describe(useNightSkyEngine, () => {
  it("returns its result", () => {
    context.eventsDatabase = createTestEventsDatabase();

    const { result } = renderHook(() => useNightSkyEngine(true));

    expect(result.current).toStrictEqual({ engine: undefined });
  });

  it("loads the database's stars and figures with the generator", async () => {
    context.eventsDatabase = createTestEventsDatabase();

    const { result } = renderHook(() => useNightSkyEngine(false));

    await waitFor(() => {
      expect(result.current.engine?.stars.length).toBeGreaterThan(100);
    });

    expect(result.current.engine?.segments.length).toBeGreaterThan(0);
  });

  it("says why when the database cannot be read", async () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    context.eventsDatabase = createFailingEventsDatabase(
      new Error("unreadable"),
    ).database;

    const { result } = renderHook(() => useNightSkyEngine(false));

    await waitFor(() => {
      expect(report).toHaveBeenCalledWith(
        "The night sky could not be loaded",
        expect.any(Error),
      );
    });

    expect(result.current.engine).toBeUndefined();

    report.mockRestore();
  });
});
