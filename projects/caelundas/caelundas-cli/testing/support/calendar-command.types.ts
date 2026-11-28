// 🏷️ Types

/** Place and date range for one command run. */
export interface CalendarCommandRun {
  /** Exclusive end date, `YYYY-MM-DD`. */
  endDate: string;
  latitude: number;
  longitude: number;
  /** Inclusive start date, `YYYY-MM-DD`. */
  startDate: string;
}
