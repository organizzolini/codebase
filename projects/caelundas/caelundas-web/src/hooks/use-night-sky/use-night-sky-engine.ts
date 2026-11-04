import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type {
  NightSkyEngine,
  UseNightSkyEngineResult,
} from "./use-night-sky-engine.types";

// 🧩 Hook

/**
 * Loads what the sky is drawn from, the stars and figures the events
 * database holds and the generator, once there is a sky to draw. The
 * generator, with the astronomy it brings, is a chunk of its own, so the
 * calendar's first paint does not wait for it. A failed read or chunk leaves
 * the page without a sky and says why, rather than failing unseen.
 */
export function useNightSkyEngine(hidden: boolean): UseNightSkyEngineResult {
  // 🪝 Hooks
  const { eventsDatabase } = useRouter().options.context;
  const [engine, setEngine] = useState<NightSkyEngine>();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    let mounted = true;

    if (!hidden) {
      void Promise.all([
        eventsDatabase.findNightSky(),
        import("./night-sky.utilities"),
      ])
        .then(([catalog, utilities]) => {
          if (mounted) {
            setEngine({
              buildNightSky: utilities.buildNightSky,
              computeStartingSiderealDegrees:
                utilities.computeStartingSiderealDegrees,
              segments: catalog.segments,
              stars: catalog.stars,
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
  }, [eventsDatabase, hidden]);

  // 🎁 Result
  return { engine };
}
