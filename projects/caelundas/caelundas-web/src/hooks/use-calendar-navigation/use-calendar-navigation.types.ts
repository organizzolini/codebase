import type { CalendarNavigation } from "../../components/calendar-navigation-group/calendar-navigation-group.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../../components/events-calendar/calendar-views.types";

// 🏷️ Types

/**
 * The view on screen and its anchor day.
 */
export interface UseCalendarNavigationProperties {
  agendaDays?: number | undefined;
  anchor: Date;
  scale?: TimelineScale | undefined;
  timeZone: string;
  view: CalendarViewName;
}

/**
 * The toolbar's navigation, and where the views report theirs.
 */
export interface UseCalendarNavigationResult {
  /**
   * Handed each view's own navigation, which only a child of it can read.
   */
  handleNavigationChange: (reported: CalendarNavigation) => void;
  navigation: CalendarNavigation;
}
