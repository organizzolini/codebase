import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderCalendarRoute } from "../../../testing/render-route";

import { NightSkyBackdropMount } from "./night-sky-backdrop-mount";

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

  it("draws nothing and reports a night sky the API cannot draw, leaving the calendar", async () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => {});

    await renderCalendarRoute("/?date=2026-03-01", {
      api: { nightSkyError: "The catalog could not be read" },
    });
    await screen.findByRole("grid", { name: "March 2026" });

    await waitFor(() => {
      expect(report).toHaveBeenCalledWith(
        "The night sky could not be loaded",
        expect.objectContaining({ message: "The catalog could not be read" }),
      );
    });

    expect(
      screen.getByTestId("night-sky-backdrop").querySelector("svg"),
    ).toBeNull();
  });
});
