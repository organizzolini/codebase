import { getEventLabel } from "../../utilities/calendar-glyphs.utilities";

import type { TimelineBar } from "../../types/calendar-timeline.types";
import type { OpenedBar } from "./use-bar-dialog.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * What opens when a marker is clicked: the events it holds, titled by their
 * count, or by the name of the one event.
 */
export function describeBar(
  bar: TimelineBar | undefined,
): OpenedBar | undefined {
  const records = bar?.records ?? [];
  const [first] = records;

  if (first === undefined) {
    return undefined;
  }

  return {
    records,
    title:
      records.length > 1
        ? `${String(records.length)} events`
        : getEventLabel(first).name,
  };
}
