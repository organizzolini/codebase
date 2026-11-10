// 🏷️ Types
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";

/** What classifying an event reads: its raw tags and its start and end. */
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
 * Raw tag strings and the paths each stands for; an empty list classifies nothing.
 */
export type TagMap = Readonly<Record<string, readonly TagPath[]>>;

/**
 * A node's place in the tag tree: its names from the root down, such as `["Type", "Aspect", "Major"]`.
 */
export type TagPath = readonly [string, ...string[]];
