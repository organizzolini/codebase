// 🏷️ Types
import type { Moment } from "moment-timezone";

/** One slice of the zodiac a body stayed in, between two minutes. */
export interface ZoneStay {
  end: Moment;
  /** Slices counted from 0° Aries. */
  index: number;
  start: Moment;
}
