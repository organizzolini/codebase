import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { CalendarSymbols } from "../../calendar-events/event-glyphs/calendar-symbols.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-by/components/event-group-model/event-groups.types";

// 🏷️ Types

/**
 * Every choice the Display list reflects: what is ticked in it.
 */
export interface DisplayChoices {
  clusters: boolean;
  colorBy: EventGroupLevel | undefined;
  colors: boolean;
  constellations: readonly string[];
  ecliptic: boolean;
  scale: TimelineScale;
  skyOff: boolean;
  symbols: CalendarSymbols;
  view: CalendarViewName;
}

/**
 * The panel of settings a footer action opens, over the list.
 */
export type DisplayPanel = "color" | "sky";
