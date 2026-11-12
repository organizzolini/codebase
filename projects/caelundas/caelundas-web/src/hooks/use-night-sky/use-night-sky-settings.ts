import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";

import { CONSTELLATIONS } from "./night-sky.constants";
import { readNightSkyOverrides } from "./use-night-sky.utilities";

import type { CalendarSearch } from "../use-calendar-search/calendar-search.types";
import type { UseNightSkySettingsResult } from "./use-night-sky-settings.types";

// 🧩 Hook

/**
 * The night sky's settings as the link sets them, and how to change the link; controls and link never disagree.
 */
export function useNightSkySettings(): UseNightSkySettingsResult {
  // 🪝 Hooks
  const settings = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readNightSkyOverrides(state.location.search),
  });
  const navigate = useNavigate({ from: "/" });

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

  // 🎁 Result
  return { change, constellations: CONSTELLATIONS, settings };
}
