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
 * Waits for the Constellations column's tree, open from the start.
 */
async function openConstellations(): Promise<void> {
  await screen.findByRole("group", { name: "Constellations to draw" });
}

/**
 * Opens the toolbar's Sky menu.
 */
async function openNightSkyMenu(): Promise<void> {
  fireEvent.click(await screen.findByRole("button", { name: "Sky options" }));
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
      screen
        .getByRole("checkbox", { name: "Other constellations" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen
        .getByRole("switch", { name: "Show the sky" })
        .getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("writes a control to the link, and the sky follows it", async () => {
    await renderRoute("/?date=2026-03-01&sky.ecliptic=false");
    await findSky();
    await openNightSkyMenu();
    await openConstellations();

    fireEvent.click(screen.getByRole("checkbox", { name: "Zodiac" }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.constellations": "none" });
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("polyline"),
      ).toBeNull();
    });

    fireEvent.click(screen.getByRole("checkbox", { name: "Zodiac" }));

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

    fireEvent.keyDown(latitude, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.lat": 89.5 });
    });
  });

  it("resets every setting it holds, and keeps the tuning view", async () => {
    await renderRoute(
      "/?date=2026-03-01&sky.lat=51.5&sky.top=%23102040&sky.eclipticOpacity=0.5&sky.debug=true",
    );
    await openNightSkyMenu();

    fireEvent.click(screen.getByRole("button", { name: "Default" }));

    await waitFor(() => {
      expect(readSearch()).not.toHaveProperty("sky.lat");
    });

    expect(readSearch()).not.toHaveProperty("sky.top");
    expect(readSearch()).not.toHaveProperty("sky.eclipticOpacity");
    expect(readSearch()).toMatchObject({ "sky.debug": true });
  });

  it.each(["all", "none"])(
    "resets sky.constellations=%s to the zodiac, the default, with a bare link",
    async (words) => {
      await renderRoute(`/?date=2026-03-01&sky.constellations=${words}`);
      await openNightSkyMenu();
      await openConstellations();

      fireEvent.click(screen.getByRole("button", { name: "Default" }));

      await waitFor(() => {
        expect(readSearch()).not.toHaveProperty("sky.constellations");
      });

      expect(
        screen
          .getByRole("checkbox", { name: "Zodiac" })
          .getAttribute("aria-checked"),
      ).toBe("true");
      expect(
        screen
          .getByRole("checkbox", { name: "Other constellations" })
          .getAttribute("aria-checked"),
      ).toBe("false");
      expect(
        screen
          .getAllByRole("checkbox")
          .filter(
            (checkbox) => checkbox.getAttribute("aria-checked") === "true",
          ),
      ).toHaveLength(13);
      expect(
        Object.keys(readSearch()).filter((key) => key.startsWith("sky")),
      ).toStrictEqual([]);

      await waitFor(() => {
        const backdrop = screen.getByTestId("night-sky-backdrop");

        expect(
          backdrop.querySelectorAll("polyline").length -
            backdrop.querySelectorAll('[data-layer="ecliptic"] polyline')
              .length,
        ).toBeGreaterThan(0);
      });
    },
  );

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

  it("writes all once every folder is checked", async () => {
    await renderRoute("/?date=2026-03-01");
    await openNightSkyMenu();
    await openConstellations();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Other constellations" }),
    );

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.constellations": "all" });
    });
  });

  it("draws the ecliptic and the zodiac's figures at the defaults", async () => {
    await renderRoute("/?date=2026-03-01");

    const sky = await findSky();

    await waitFor(() => {
      expect(
        sky.querySelector('[data-layer="ecliptic"] polyline'),
      ).not.toBeNull();
    });

    expect(
      sky.querySelectorAll("polyline").length -
        sky.querySelectorAll('[data-layer="ecliptic"] polyline').length,
    ).toBeGreaterThan(0);
  });

  it("hides the ecliptic from its switch, and the Default button brings it back", async () => {
    await renderRoute("/?date=2026-03-01");
    await findSky();
    await openNightSkyMenu();

    fireEvent.click(screen.getByRole("switch", { name: "Show the ecliptic" }));

    await waitFor(() => {
      expect(readSearch()).toMatchObject({ "sky.ecliptic": false });
    });
    await waitFor(() => {
      expect(
        screen
          .getByTestId("night-sky-backdrop")
          .querySelector('[data-layer="ecliptic"]'),
      ).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Default" }));

    await waitFor(() => {
      expect(readSearch()).not.toHaveProperty("sky.ecliptic");
    });
    await waitFor(() => {
      expect(
        screen
          .getByTestId("night-sky-backdrop")
          .querySelector('[data-layer="ecliptic"] polyline'),
      ).not.toBeNull();
    });
  });
});
