import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "../../../testing/render-route";

import { NightSkyBackdropMount } from "./night-sky-backdrop-mount";

// What the catalog's chunk does when it loads: fails as a chunk does, answers
// with rows the schema rejects, or answers well.
const catalog = vi.hoisted(() => ({
  mode: "failing",
}));

vi.mock(import("../../hooks/use-night-sky/use-night-sky.catalog.json"), () => ({
  get default(): never[] {
    if (catalog.mode === "failing") {
      throw new Error("The chunk could not be loaded");
    }

    return [["not", "a", "row"]] as never[];
  },
}));

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
    "draws nothing and reports a catalog that is %s",
    async (mode) => {
      catalog.mode = mode;

      const report = vi.spyOn(console, "error").mockImplementation(() => {});

      await renderRoute("/?date=2026-03-01");
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
