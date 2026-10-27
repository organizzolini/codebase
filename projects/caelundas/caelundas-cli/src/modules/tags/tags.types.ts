// 🏷️ Types
import type { DetectedCalendarEvent } from "../database/database.types";

/** What classifying an event reads: its raw tags and its start and end. */
export type ClassifiableEvent = Pick<
  DetectedCalendarEvent,
  "end" | "start" | "tags"
>;

/**
 * Raw tag strings and the paths each stands for. An empty list means the
 * raw tag classifies nothing; a raw tag missing from every map falls back to
 * a root of its own.
 */
export type TagMap = Readonly<Record<string, readonly TagPath[]>>;

/**
 * A node's place in the tag tree: the names from its root down to it, so
 * `["Type", "Aspect", "Major"]` names the `Major` node under `Aspect` under
 * the `Type` root. An event carrying a path is linked to its last node, and
 * carries the ones above it through the closure table.
 */
export type TagPath = readonly [string, ...string[]];
