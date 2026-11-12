// 🏷️ Types
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";

/** What classifying an event reads: raw tags, start and end. */
export type ClassifiableEvent = Pick<
  DetectedCalendarEvent,
  "end" | "start" | "tags"
>;

/** An event to write, with the tag paths it is classified under. */
export interface ClassifiedCalendarEvent {
  event: DetectedCalendarEvent;
  paths: readonly TagPath[];
}

/**
 * Raw tag strings and the paths each stands for.
 */
export type TagMap = Readonly<Record<string, readonly TagPath[]>>;

/** Node's names from the root down, e.g. `["Type", "Aspect"]`. */
export type TagPath = readonly [string, ...string[]];
