// 🏷️ Types
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { TagMenuFlags } from "./modules/tag-metadata/tag-metadata.types";

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

/** Stored tags by id, parent and slug, and their edges. */
export interface KnownTags {
  edges: Set<string>;
  flags: Map<string, TagMenuFlags>;
  ids: Map<string, string>;
  slugs: Map<string, string>;
}

/** One row of `tag_edges`: a parent and its child. */
export interface TagEdgeRow {
  sourceNode: string;
  targetNode: string;
}

/** An element of the signs. */
export type TagElement = "Air" | "Earth" | "Fire" | "Water";

/**
 * Raw tag strings and the paths each stands for.
 */
export type TagMap = Readonly<Record<string, readonly TagPath[]>>;

/** Node's names from the root down, e.g. `["Type", "Aspect"]`. */
export type TagPath = readonly [string, ...string[]];
