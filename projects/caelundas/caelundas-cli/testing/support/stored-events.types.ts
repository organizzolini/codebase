// 🏷️ Types
import type { Moment } from "moment-timezone";

/** A stored event as a test reads it: its title and its direct tag names. */
export interface StoredEvent {
  summary: string;
  tags: string[];
}

/** The range and location of the stored events a test reads back. */
export interface StoredEventsRange {
  /** Exclusive end of the range. */
  end: Moment;
  latitude: number;
  longitude: number;
  /** Inclusive start of the range. */
  start: Moment;
}
