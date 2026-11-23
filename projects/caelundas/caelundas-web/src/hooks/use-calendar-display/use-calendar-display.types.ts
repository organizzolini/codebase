import type { TimelineScale } from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { CalendarSymbols } from "../../components/calendar-events/event-glyphs/calendar-symbols.types";
import type { CalendarSearch } from "../use-calendar-search/calendar-search.types";
import type { UseCalendarSearchResult } from "../use-calendar-search/use-calendar-search.types";
import type { UseNightSkySettingsResult } from "../use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings.types";

// 🏷️ Types

/**
 * What the link says about how the calendar looks, with every default filled in.
 */
export interface CalendarDisplayState {
  clusters: boolean;
  colors: boolean;
  scale: TimelineScale;
  symbols: CalendarSymbols;
}

/**
 * How the calendar looks, the night sky's settings, and the handlers that write each change to the link.
 */
export interface UseCalendarDisplayResult {
  /**
   * Writes a change to the night sky's settings to the link.
   */
  change: (next: Partial<CalendarSearch>) => void;
  /**
   * The constellations the sky can draw, which its figures are picked from.
   */
  constellations: UseNightSkySettingsResult["constellations"];
  handlers: Pick<
    UseCalendarSearchResult,
    | "handleClustersChange"
    | "handleColorByChange"
    | "handleColorsChange"
    | "handleScaleChange"
    | "handleSymbolsChange"
    | "handleViewChange"
  >;
  sky: UseNightSkySettingsResult["settings"];
  state: CalendarDisplayState;
}
