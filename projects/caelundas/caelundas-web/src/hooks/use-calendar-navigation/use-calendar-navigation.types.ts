import type { CalendarNavigation } from "../../components/calendar-navigation-group.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../../types/calendar-views.types";

// 🏷️ Types

/**
 * The view on screen and the day it is anchored on, which say whether today
 * is already shown.
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
