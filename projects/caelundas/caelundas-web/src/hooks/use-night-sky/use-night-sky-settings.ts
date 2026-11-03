import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { readNightSkyOverrides } from "./use-night-sky.utilities";

import type { CalendarSearch } from "../use-calendar-search/calendar-search.types";
import type { ConstellationListing } from "./night-sky.types";
import type { UseNightSkySettingsResult } from "./use-night-sky-settings.types";

// 🧩 Hook

/**
 * The night sky's settings as the link sets them, the constellations the
 * database lists, and how to change the link: the controls the View menu
 * draws read and write the same `sky.*` keys the backdrop reads, so a
 * control and the link never disagree.
 */
export function useNightSkySettings(): UseNightSkySettingsResult {
  // 🪝 Hooks
  const settings = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readNightSkyOverrides(state.location.search),
  });
  const navigate = useNavigate({ from: "/" });
  const { eventsDatabase } = useRouter().options.context;
  const [constellations, setConstellations] = useState<
    readonly ConstellationListing[]
  >([]);

  // 🏗 Setup

  // 💪 Handlers
  const change = useCallback(
    (next: Partial<CalendarSearch>): void => {
      void navigate({
        replace: true,
        search: (previous) => ({ ...previous, ...next }),
      });
    },
    [navigate],
  );

  // ♻️ Lifecycle
  useEffect(() => {
    let mounted = true;

    eventsDatabase
      .findConstellations()
      .then((listing) => {
        if (mounted) {
          setConstellations(listing);
        }
      })
      .catch((error: unknown) => {
        console.error("The constellations could not be listed", error);
      });

    return () => {
      mounted = false;
    };
  }, [eventsDatabase]);

  // 🎁 Result
  return { change, constellations, settings };
}
