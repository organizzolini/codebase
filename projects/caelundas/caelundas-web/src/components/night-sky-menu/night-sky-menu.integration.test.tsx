import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "../../../testing/render-route";
import { getRouter } from "../../router";
import { NightSkyBackdropMount } from "../night-sky-backdrop/night-sky-backdrop-mount";

// The route helper renders under a bare root, so the backdrop the real root
// mounts is wrapped around the router's matches here, and the router kept
// for its location.
vi.mock(import("../../router"), async (importOriginal) => {
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
 * Opens the submenu's Constellations section, closed at first.
 */
async function openConstellations(): Promise<void> {
  fireEvent.click(
    await screen.findByRole("button", { name: "Constellations" }),
  );
  await screen.findByRole("group", { name: "Constellations to draw" });
}

/**
 * Opens the View menu, then its Night sky submenu.
 */
async function openNightSkyMenu(): Promise<void> {
  fireEvent.click(
    await screen.findByRole("button", { name: /^View options/u }),
  );
  fireEvent.click(await screen.findByText("Night sky"));
  await screen.findByRole("group", { name: "Night sky settings" });
}

/**
 * The search of the router the last render was given.
 */
function readSearch(): Readonly<Record<string, unknown>> {
  const router = vi.mocked(getRouter).mock.results.at(-1)?.value;

  return router?.state.location.search ?? {};
}

describe("night sky menu", () => {
  afterEach(() => {
    cleanup();
  });

  it("sets its controls from the link", async () => {
    await renderRoute(
      "/?date=2026-03-01&sky.constellations=all&sky.lat=51.5&sky=off",
    );
    await openNightSkyMenu();
    await openConstellations();

    expect(screen.getByText("51.5°")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "false",
    );
  });

  it("writes a control to the link, and the sky follows it", async () => {
    await renderRoute("/?date=2026-03-01&sky.lat=75");
    await findSky();
    await openNightSkyMenu();
    await openConstellations();

    fireEvent.click(screen.getByRole("button", { name: "None" }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.constellations": "none" });
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("polyline"),
      ).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Zodiac" }));

    await waitFor(() => {
      expect(readSearch()).not.toHaveProperty("sky.constellations");
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("polyline"),
      ).not.toBeNull();
    });
  });

  it("steps a slider from the keyboard and writes the step to the link", async () => {
    await renderRoute("/?date=2026-03-01");
    await openNightSkyMenu();

    const [latitude] = screen.getAllByLabelText("Latitude", {
      selector: "input",
    });

    if (latitude === undefined) {
      throw new Error("No slider is labelled Latitude");
    }

    fireEvent.keyDown(latitude, { key: "ArrowRight" });

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.lat": 41 });
    });
  });

  it("resets every setting it holds, and keeps the tuning view", async () => {
    await renderRoute(
      "/?date=2026-03-01&sky.lat=51.5&sky.top=%23102040&sky.debug=true",
    );
    await openNightSkyMenu();

    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));

    await waitFor(() => {
      expect(readSearch()).not.toHaveProperty("sky.lat");
    });

    expect(readSearch()).not.toHaveProperty("sky.top");
    expect(readSearch()).toMatchObject({ "sky.debug": true });
  });

  it("toggles all twelve zodiac figures from their folder, dashed when some show", async () => {
    await renderRoute("/?date=2026-03-01");
    await openNightSkyMenu();
    await openConstellations();

    const folder = screen.getByRole("checkbox", { name: "Zodiac" });

    expect(folder.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(folder);

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.constellations": "none" });
    });

    fireEvent.click(screen.getByRole("checkbox", { name: "Leo" }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.constellations": "leo" });
    });

    expect(
      screen
        .getByRole("checkbox", { name: "Zodiac" })
        .getAttribute("aria-checked"),
    ).toBe("mixed");

    fireEvent.click(screen.getByRole("checkbox", { name: "Zodiac" }));

    await waitFor(() => {
      expect(readSearch()).not.toHaveProperty("sky.constellations");
    });
  });
});
