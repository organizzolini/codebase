import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  REDUCED_MOTION_QUERY,
  RESIZE_DEBOUNCE_MILLISECONDS,
} from "./use-night-sky.constants";
import { readNightSkyOverrides } from "./use-night-sky.overrides";
import { starCatalogSchema } from "./use-night-sky.schemas";

import type { StarRow } from "./use-night-sky.types";
import type {
  buildNightSky,
  computeStartingSiderealDegrees,
} from "./use-night-sky.utilities";

/**
 * Builds the night sky behind the page as an SVG, or nothing while the star
 * catalog loads, when the link turns it off, and for a latitude of zero or
 * below, which the northern view cannot draw. It reads only its own keys of
 * the link, so a change elsewhere does not render it and a change to them does
 * not render the page.
 */
export function useNightSky(): string | undefined {
  // 🪝 Hooks
  // The router's state and not a match's search, since the root shell that
  // mounts the backdrop is rendered outside every match.
  const overrides = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readNightSkyOverrides(state.location.search),
  });
  const [engine, setEngine] = useState<Engine>();
  const [size, setSize] = useState<Size>();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    isReducedMotion,
    () => false,
  );

  // 🏗 Setup
  const hidden = overrides.off || overrides.latitudeDegrees <= 0;
  const sky = useMemo(
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
          }).svg,
    [engine, hidden, overrides, size],
  );

  // ♻️ Lifecycle

  // The catalog and the generator, with the astronomy it brings, are chunks
  // of their own, so the calendar's first paint does not wait for them, and
  // they are read only when there is a sky to draw.
  useEffect(() => {
    if (hidden) {
      return;
    }

    void Promise.all([
      import("./use-night-sky.catalog.json"),
      import("./use-night-sky.utilities"),
    ]).then(([catalog, utilities]) => {
      setEngine({
        buildNightSky: utilities.buildNightSky,
        computeStartingSiderealDegrees:
          utilities.computeStartingSiderealDegrees,
        stars: starCatalogSchema.parse(catalog.default),
      });
    });
  }, [hidden]);

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

  // 🎨 Result
  return reducedMotion ? sky?.replace(ANIMATION_PATTERN, "") : sky;
}

// Only the one element that turns the sky is animated.
const ANIMATION_PATTERN = /<animateTransform[^>]*\/>/u;

/**
 * What a sky is built with: the catalog and the generator, loaded together.
 */
interface Engine {
  buildNightSky: typeof buildNightSky;
  computeStartingSiderealDegrees: typeof computeStartingSiderealDegrees;
  stars: readonly StarRow[];
}

/**
 * The window's size in pixels.
 */
interface Size {
  height: number;
  width: number;
}

/**
 * Whether the page asks for reduced motion.
 */
function isReducedMotion(): boolean {
  return globalThis.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Calls back when the preference changes, in the shape
 * `useSyncExternalStore` subscribes with, returning how to stop.
 */
function subscribeToReducedMotion(onChange: () => void): () => void {
  const list = globalThis.matchMedia(REDUCED_MOTION_QUERY);

  list.addEventListener("change", onChange);

  return () => {
    list.removeEventListener("change", onChange);
  };
}
