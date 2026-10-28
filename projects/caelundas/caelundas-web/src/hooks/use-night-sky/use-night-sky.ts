import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { RESIZE_DEBOUNCE_MILLISECONDS } from "./night-sky.constants";
import { starCatalogSchema } from "./use-night-sky.schemas";
import {
  isReducedMotion,
  readNightSkyOverrides,
  subscribeToReducedMotion,
} from "./use-night-sky.utilities";

import type {
  NightSkyEngine,
  UseNightSkyResult,
  WindowSize,
} from "./use-night-sky.types";

// 🧩 Hook

/**
 * Builds the night sky behind the page as an SVG, or nothing while the star
 * catalog loads, when the link turns it off, and for a latitude of zero or
 * below, which the northern view cannot draw. It reads only its own keys of
 * the link, so a change elsewhere does not render it and a change to them does
 * not render the page.
 */
export function useNightSky(): UseNightSkyResult {
  // 🪝 Hooks
  // The router's state and not a match's search, since the root shell that
  // mounts the backdrop is rendered outside every match.
  const overrides = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readNightSkyOverrides(state.location.search),
  });
  const [engine, setEngine] = useState<NightSkyEngine>();
  const [size, setSize] = useState<WindowSize>();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    isReducedMotion,
    () => false,
  );

  // 🏗 Setup
  const hidden = overrides.off || overrides.latitudeDegrees <= 0;
  const built = useMemo(
    () =>
      engine === undefined || size === undefined || hidden
        ? undefined
        : engine.buildNightSky({
            ...overrides,
            ...size,
            localSiderealDegrees: engine.computeStartingSiderealDegrees(
              new Date(),
              overrides.longitudeDegrees,
            ),
            stars: engine.stars,
            still: reducedMotion,
          }),
    [engine, hidden, overrides, reducedMotion, size],
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // The catalog and the generator, with the astronomy it brings, are chunks
  // of their own, so the calendar's first paint does not wait for them, and
  // they are read only when there is a sky to draw.
  useEffect(() => {
    let mounted = true;

    // A chunk that fails to load, or a catalog that fails its schema, leaves
    // the page without a sky and says why, rather than failing unseen.
    if (!hidden) {
      void Promise.all([
        import("./use-night-sky.catalog.json"),
        import("./night-sky.utilities"),
      ])
        .then(([catalog, utilities]) => {
          if (mounted) {
            setEngine({
              buildNightSky: utilities.buildNightSky,
              computeStartingSiderealDegrees:
                utilities.computeStartingSiderealDegrees,
              stars: starCatalogSchema.parse(catalog.default),
            });
          }
        })
        .catch((error: unknown) => {
          console.error("The night sky could not be loaded", error);
        });
    }

    return () => {
      mounted = false;
    };
  }, [hidden]);

  // A field of view that would put the pole on screen is reduced, and says so.
  useEffect(() => {
    if (built?.measurements.fieldOfViewClamped) {
      console.warn(
        `The night sky's field of view was reduced to ${built.measurements.fieldOfViewLimitDegrees.toFixed(1)} degrees to keep the pole off screen`,
      );
    }
  }, [built]);

  // The sky is built to the window's size, which is read after mount and
  // again once a resize has settled.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = (): void => {
      setSize({ height: window.innerHeight, width: window.innerWidth });
    };
    const handleResize = (): void => {
      clearTimeout(timer);
      timer = setTimeout(measure, RESIZE_DEBOUNCE_MILLISECONDS);
    };

    measure();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 🎁 Result
  return { sky: built?.svg };
}
