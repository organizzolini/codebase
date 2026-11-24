// 🏷️ Types

import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";

/**
 * The consecutive levels of one field, shown as one chip.
 */
export interface GroupRun {
  field: string;
  levels: EventGroupLevel[];
}
