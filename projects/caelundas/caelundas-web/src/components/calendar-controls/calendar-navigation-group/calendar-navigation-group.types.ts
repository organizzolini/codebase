// 🏷️ Types

/**
 * Moves the view and titles its period: calendar or timeline.
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
