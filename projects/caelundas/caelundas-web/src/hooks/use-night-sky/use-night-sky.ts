import { useRouterState } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef as useReference,
  useState,
  useSyncExternalStore,
} from "react";

import { queryApi } from "../../components/events-calendar/events-api.utilities";
import { NightSkyDocument } from "../../graphql/generated/operations";

import {
  describeNightSkyProblems,
  findUnknownConstellationNames,
  isFieldOfViewCut,
  isReducedMotion,
  readNightSkyOverrides,
  subscribeToReducedMotion,
  toNightSkyDrawing,
  toNightSkyInput,
} from "./use-night-sky.utilities";
import { useWindowSize } from "./use-window-size";

import type { NightSkyQuery } from "../../graphql/generated/operations";
import type { UseNightSkyResult } from "./use-night-sky.types";

// 🧩 Hook

/**
 * Asks the API for the night sky behind the page as an SVG, or nothing while
 * it is on its way, when the link turns it off, and for a latitude of zero or
 * below, which the northern view cannot draw. The sky already drawn stays
 * until the next one arrives, so a change to the link or a resize does not
 * blank the page. It reads only its own keys of the link, so a change
 * elsewhere does not render it and a change to them does not render the page.
 * A failed request leaves the page without a sky and says why, rather than
 * failing unseen.
 */
export function useNightSky(): UseNightSkyResult {
  // 🪝 Hooks
  // The router's state and not a match's search, since the root shell that
  // mounts the backdrop is rendered outside every match.
  // Without the opacities, which the page applies, so moving one does not
  // ask the API for the same sky again.
  const overrides = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => toNightSkyDrawing(readNightSkyOverrides(state.location.search)),
    structuralSharing: true,
  });
  const { size } = useWindowSize();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    isReducedMotion,
    () => false,
  );
  const [built, setBuilt] = useState<NightSkyQuery["nightSky"]>();
  const warned = useReference(new Set<string>());

  // 🏗 Setup
  const hidden = overrides.off || overrides.latitudeDegrees <= 0;
  const input = useMemo(
    () =>
      size === undefined || hidden
        ? undefined
        : toNightSkyInput(overrides, { size, still: reducedMotion }),
    [hidden, overrides, reducedMotion, size],
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // The sky for each input the page settles on, the latest answer winning.
  useEffect(() => {
    let mounted = true;

    if (input !== undefined) {
      queryApi(NightSkyDocument, { input })
        .then(({ nightSky }) => {
          if (mounted) {
            setBuilt(nightSky);
          }
        })
        .catch((error: unknown) => {
          console.error("The night sky could not be loaded", error);
        });
    }

    return () => {
      mounted = false;
    };
  }, [input]);

  // A field of view that would put the pole on screen is reduced, and says
  // so when the cut is more than the pole's own margin.
  useEffect(() => {
    if (
      built !== undefined &&
      isFieldOfViewCut(built.measurements, overrides.verticalFieldOfViewDegrees)
    ) {
      console.warn(
        `The night sky's field of view was reduced to ${built.measurements.fieldOfViewLimitDegrees.toFixed(1)} degrees to keep the pole off screen`,
      );
    }
  }, [built, overrides.verticalFieldOfViewDegrees]);

  // A line style key the link gives a value it cannot read, and a
  // constellation it names that has no figure, are left out, and said so once.
  useEffect(() => {
    for (const message of describeNightSkyProblems(
      overrides.rejectedKeys,
      findUnknownConstellationNames(overrides.constellations),
    )) {
      if (!warned.current.has(message)) {
        warned.current.add(message);
        console.warn(message);
      }
    }
  }, [overrides]);

  // 🎁 Result
  return { sky: hidden ? undefined : built?.svg };
}
