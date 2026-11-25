import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../../testing/calendar-api";
import { findToolbar } from "../../../../testing/calendar-page";
import { renderCalendarRoute } from "../../../../testing/render-route";
import { getRouter } from "../../../router";
import { NightSkyBackdropMount } from "../../calendar-appearance/night-sky-backdrop/night-sky-backdrop-mount";

// The route helper renders under a bare root, so the backdrop the real root
// mounts is wrapped around the router's matches here, and the router kept
// for its location.
vi.mock(import("../../../router"), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    getRouter: vi.fn(() => {
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
    }),
  };
});

/** Finds a Display option by label, a leaf or a branch with its item count. */
async function findOption(label: string): Promise<HTMLElement> {
  const name = new RegExp(`^${label}(,|$|[A-Z])`, "u");

  return waitFor(() => {
    const found =
      screen.queryByRole("treeitem", { name }) ??
      screen.queryByRole("option", { name });

    if (found === null) {
      throw new Error(`No option named ${label}`);
    }

    return found;
  });
}

/**
 * The backdrop's SVG once the sky is built.
 */
async function findSky(): Promise<SVGSVGElement> {
  return waitFor(() => {
    const svg = screen.getByTestId("night-sky-backdrop").querySelector("svg");

    if (svg === null) {
      throw new Error("The backdrop holds no sky yet");
    }

    return svg;
  });
}

/**
 * Opens the Display list and expands the branches named, one beneath the other.
 */
async function openBranches(...labels: string[]): Promise<void> {
  fireEvent.click(
    await within(await findToolbar()).findByRole("button", { name: "Display" }),
  );

  for (const label of labels) {
    fireEvent.click(await findOption(label));
  }
}

/**
 * The search of the router the last render was given.
 */
function readSearch(): Readonly<Record<string, unknown>> {
  const router = vi.mocked(getRouter).mock.results.at(-1)?.value;

  return router?.state.location.search ?? {};
}

// Each test renders the whole route and builds the sky, then drives the
// menu; a loaded continuous integration runner took past 5 seconds for most.
vi.setConfig({ testTimeout: 30_000 });

describe("display menu's sky options", () => {
  afterEach(() => {
    cleanup();
  });

  it("hides the sky and shows it again, writing the link", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    await findSky();
    await openBranches("Skyfield");
    fireEvent.click(await findOption("Show the skyfield"));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ skyfield: "off" });
    });

    fireEvent.click(await findOption("Show the skyfield"));

    await waitFor(() => {
      expect(readSearch()).not.toHaveProperty("skyfield");
    });
  });

  it("draws the zodiac's figures alone, and all of them again", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    const api = readServedApi();

    await findSky();
    await openBranches("Skyfield", "Constellations");
    fireEvent.click(await findOption("Zodiac"));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({
        "skyfield.constellations": "zodiac",
      });
    });
    await waitFor(() => {
      expect(api.requests.nightSky.at(-1)?.constellations).toStrictEqual([
        "zodiac",
      ]);
    });

    fireEvent.click(await findOption("All"));

    await waitFor(() => {
      expect(readSearch()).not.toHaveProperty("skyfield.constellations");
    });
    await waitFor(() => {
      expect(api.requests.nightSky.at(-1)?.constellations).toStrictEqual([
        "all",
      ]);
    });
  });

  it("hides one figure of all, naming the rest", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    await findSky();
    await openBranches("Skyfield", "Constellations", "Other figures");
    fireEvent.click(await findOption("Orion"));

    await waitFor(() => {
      expect(String(readSearch()["skyfield.constellations"])).toMatch(
        /^zodiac,/u,
      );
    });

    expect(String(readSearch()["skyfield.constellations"])).not.toContain(
      "orion",
    );
  });

  it("sets a setting to one of its values", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    await findSky();
    await openBranches("Skyfield", "Opacity");
    fireEvent.click(await findOption("0.5"));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "skyfield.opacity": 0.5 });
    });
  });

  it("sets a color to one of its swatches", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    await findSky();
    await openBranches("Skyfield", "Background", "Skyfield top color");
    fireEvent.click(await findOption("Amber"));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "skyfield.top": "#fbbf24" });
    });
  });

  it("ticks what the link sets, and puts the sky back to its default", async () => {
    await renderCalendarRoute(
      "/?date=2026-03-01&skyfield.constellations=zodiac&skyfield.opacity=0.5",
    );
    await findSky();
    await openBranches("Skyfield", "Constellations");

    const zodiac = await findOption("Zodiac");
    const all = await findOption("All");

    expect(zodiac.getAttribute("aria-selected")).toBe("true");
    expect(all.getAttribute("aria-selected")).toBe("false");

    fireEvent.click(await findOption("Default skyfield"));

    await waitFor(() => {
      expect(
        Object.keys(readSearch()).filter((key) => key.startsWith("skyfield")),
      ).toStrictEqual([]);
    });
  });
});
