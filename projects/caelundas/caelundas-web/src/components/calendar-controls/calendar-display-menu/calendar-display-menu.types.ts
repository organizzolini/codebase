import type { ConstellationListing } from "../../../hooks/use-night-sky/night-sky.types";
import type { NightSkyOverrides } from "../../../hooks/use-night-sky/use-night-sky.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { CalendarSymbols } from "../../calendar-events/event-glyphs/calendar-symbols.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";

// 🏷️ Types

/**
 * Every choice the Display list reflects: what is ticked in it.
 */
export interface DisplayChoices {
  clusters: boolean;
  colorBy: EventGroupLevel | undefined;
  colors: boolean;
  /**
   * The constellations the sky can draw.
   */
  listing: readonly ConstellationListing[];
  scale: TimelineScale;
  sky: NightSkyOverrides;
  symbols: CalendarSymbols;
  view: CalendarViewName;
}
