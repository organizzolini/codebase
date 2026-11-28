// 🏷️ Types

import type { TagMenuFlag } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";
import type { CascaderNode } from "@codebase/presentation";

/**
 * The consecutive levels of one field, shown as one chip.
 */
export interface GroupRun {
  field: string;
  levels: EventGroupLevel[];
}

/**
 * One tag's row in a menu, with its depth beneath the root.
 */
export interface TagItemRow {
  depth: number;
  id: string;
  node: CascaderNode;
}

/**
 * Which tags a menu lists: those its flag offers.
 */
export interface TagItemsMenu {
  flag: TagMenuFlag;
  leaves: boolean;
}
