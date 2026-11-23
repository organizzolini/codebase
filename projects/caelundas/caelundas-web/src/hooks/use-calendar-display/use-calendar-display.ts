import { useRouterState } from "@tanstack/react-router";

import { DEFAULT_TIMELINE_SCALE } from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { DEFAULT_CALENDAR_SYMBOLS } from "../../components/calendar-events/event-glyphs/calendar-symbols.constants";
import { readCalendarSearch } from "../use-calendar-search/calendar-search.utilities";
import { useCalendarSearch } from "../use-calendar-search/use-calendar-search";
import { useNightSkySettings } from "../use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings";

import type { UseCalendarDisplayResult } from "./use-calendar-display.types";

// 🧩 Hook

/** How the calendar looks as the link sets it, the night sky's settings, and handlers writing changes back to the link. */
export function useCalendarDisplay(timeZone: string): UseCalendarDisplayResult {
  // 🪝 Hooks
  const search = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readCalendarSearch(state.location.search),
    structuralSharing: true,
  });
  const handlers = useCalendarSearch(timeZone);
  const { change, constellations, settings } = useNightSkySettings();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    change,
    constellations,
    handlers: {
      handleClustersChange: handlers.handleClustersChange,
      handleColorByChange: handlers.handleColorByChange,
      handleColorsChange: handlers.handleColorsChange,
      handleScaleChange: handlers.handleScaleChange,
      handleSymbolsChange: handlers.handleSymbolsChange,
      handleViewChange: handlers.handleViewChange,
    },
    sky: settings,
    state: {
      clusters: search.clusters !== false,
      colors: search.colors !== false,
      scale: search.scale ?? DEFAULT_TIMELINE_SCALE,
      symbols: search.symbols ?? DEFAULT_CALENDAR_SYMBOLS,
    },
  };
}
