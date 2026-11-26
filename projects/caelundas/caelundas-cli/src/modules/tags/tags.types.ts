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

/** Stored tags: ids by parent and name, names by parent and slug, and the edges between them. */
export interface KnownTags {
  edges: Set<string>;
  ids: Map<string, string>;
  slugs: Map<string, string>;
}

/** One row of `tag_edges`: a parent tag and a child it refines into. */
export interface TagEdgeRow {
  sourceNode: string;
  targetNode: string;
}

/**
 * Raw tag strings and the paths each stands for.
 */
export type TagMap = Readonly<Record<string, readonly TagPath[]>>;

/** Node's names from the root down, e.g. `["Type", "Aspect"]`. */
export type TagPath = readonly [string, ...string[]];
