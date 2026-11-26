// 🏷️ Types
import type { EventFilterGroupEntity } from "../filtering/modules/rules/event-filter.entities";
import type { EventGroupLevelEntity } from "../grouping/event-group-level.entities";

/**
 * The ids of tags the Filter and Group menus leave out.
 */
export interface BlockedTags {
  filter: ReadonlySet<string>;
  group: ReadonlySet<string>;
}

/**
 * The filter, levels and color level a query names tags in.
 */
export interface TagInputs {
  colorBy?: EventGroupLevelEntity | null | undefined;
  filter?: EventFilterGroupEntity | null | undefined;
  levels?: EventGroupLevelEntity[] | null | undefined;
}
