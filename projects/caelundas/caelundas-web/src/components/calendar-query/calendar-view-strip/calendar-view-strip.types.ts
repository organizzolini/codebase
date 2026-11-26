import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { EventGroupLevel } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";

// 🏷️ Types

/**
 * One thing the View list offers.
 */
export interface ViewChoice {
  description: string;
  /**
   * The lucide slug that leads the name.
   */
  icon: string;
  id: string;
  label: string;
}

/**
 * A view, written by tag names.
 */
export interface ViewDefinition {
  description: string;
  /**
   * The tags the view keeps, any of them; every event when empty.
   */
  filter: readonly ViewTagsReference[];
  /**
   * The levels the view groups by, outermost first.
   */
  group: readonly ViewLevelReference[];
  icon: string;
  id: string;
  name: string;
  /**
   * The tag orders the view sorts by, first first.
   */
  sort: readonly ViewLevelReference[];
}

/**
 * A tag by name to group or sort by.
 */
export interface ViewLevelReference {
  /**
   * The tag's names beneath its root, joined by " / "; the root's own tags when absent.
   */
  path?: string;
  root: string;
}

/**
 * A view resolved against the data.
 */
export interface ViewResolved extends ViewSelection {
  description: string;
  icon: string;
  id: string;
  name: string;
}

/**
 * What a view writes to the link.
 */
export interface ViewSelection {
  filter: EventFilterQuery;
  group: EventGroupLevel[] | undefined;
  sort: GroupSort[] | undefined;
}

/**
 * The tags of one root a view keeps.
 */
export interface ViewTagsReference {
  paths: readonly string[];
  root: string;
}
