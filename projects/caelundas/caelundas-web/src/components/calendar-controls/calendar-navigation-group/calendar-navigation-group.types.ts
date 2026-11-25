import type { CalendarDatePickerProperties } from "../calendar-date-picker/calendar-date-picker";

// 🏷️ Types

/**
 * What the title's picker takes: range, open state, handlers.
 */
export type CalendarDatePickerBinding = Omit<
  CalendarDatePickerProperties,
  "className" | "title" | "triggerClassName"
>;

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
