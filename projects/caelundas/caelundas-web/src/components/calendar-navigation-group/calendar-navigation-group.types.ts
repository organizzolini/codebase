// 🏷️ Types

/**
 * How the toolbar moves the view it sits over, and the title of the period
 * shown: the event calendar's or the timeline's.
 */
export interface CalendarNavigation {
  /**
   * Whether the days the view shows include today, when the Today button
   * has nowhere to go and is switched off.
   */
  isToday?: boolean;
  next: () => void;
  prev: () => void;
  title: string;
  today: () => void;
}
