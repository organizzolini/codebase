import type { GroupField } from "../gallery-group-by/gallery-group-by.types";
import type { GalleryMeander } from "../meander-gallery/meanders-api.types";

// 🏷️ Types

/**
 * A header, or the cards under one, of the flat list.
 */
export type GroupedItem =
  | {
      count: number;
      depth: number;
      /** Whether the group began before the pages showing. */
      isContinued: boolean;
      key: string;
      kind: "header";
      label: string;
    }
  | { key: string; kind: "cards"; meanders: readonly GalleryMeander[] };

/**
 * A group's exact count, and where it starts in the sequence.
 */
export interface GroupExtent {
  count: number;
  /** How many meanders come before it, over every page. */
  start: number;
}

/**
 * One level a meander falls under: its key and group id.
 */
export interface GroupStep {
  field: GroupField | undefined;
  id: string;
  key: string;
  name: string;
}
