import { useRouterState } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef as useReference,
  useSyncExternalStore,
} from "react";

import { useNightSkyEngine } from "./use-night-sky-engine";
import {
  findUnknownConstellationNames,
  isReducedMotion,
  readNightSkyOverrides,
  selectConstellationSegments,
  subscribeToReducedMotion,
} from "./use-night-sky.utilities";
import { useWindowSize } from "./use-window-size";

import type { UseNightSkyResult } from "./use-night-sky.types";

// 🧩 Hook

/**
 * Builds the night sky behind the page as an SVG, or nothing while its stars
 * load, when the link turns it off, and for a latitude of zero or below,
 * which the northern view cannot draw. It reads only its own keys of the
 * link, so a change elsewhere does not render it and a change to them does
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
  const hidden = overrides.off || overrides.latitudeDegrees <= 0;
  const { engine } = useNightSkyEngine(hidden);
  const { size } = useWindowSize();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    isReducedMotion,
    () => false,
  );
  const warned = useReference(new Set<string>());

  // 🏗 Setup
  const built = useMemo(
    () =>
      engine === undefined || size === undefined || hidden
        ? undefined
        : engine.buildNightSky({
            ...overrides,
            ...size,
            constellationSegments: selectConstellationSegments(
              engine.segments,
              overrides.constellations,
            ),
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

  // A field of view that would put the pole on screen is reduced, and says so.
  useEffect(() => {
    if (built?.measurements.fieldOfViewClamped) {
      console.warn(
        `The night sky's field of view was reduced to ${built.measurements.fieldOfViewLimitDegrees.toFixed(1)} degrees to keep the pole off screen`,
      );
    }
  }, [built]);

  // A constellation the link names that has no figure is left out, and said
  // so once.
  useEffect(() => {
    const unknown = findUnknownConstellationNames(
      engine?.segments ?? [],
      engine === undefined ? [] : overrides.constellations,
    );

    for (const name of new Set(unknown)) {
      if (warned.current.has(name)) {
        continue;
      }

      warned.current.add(name);
      console.warn(`The night sky has no constellation named ${name}`);
    }
  }, [engine, overrides.constellations]);

  // 🎁 Result
  return { sky: built?.svg };
}
