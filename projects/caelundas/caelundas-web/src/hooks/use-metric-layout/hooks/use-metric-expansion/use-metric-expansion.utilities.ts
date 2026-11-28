import type { MetricGroup } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { PickedGroup } from "../../../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";

// 🌎 Public Functions

/**
 * A tree's group by id, named for the Group strip in a color; none when absent.
 */
export function toPickedGroup(
  groups: readonly MetricGroup[],
  id: string,
  color: string | undefined,
): PickedGroup | undefined {
  const pending = [...groups];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    if (node.id === id) {
      return { color, id, label: node.label };
    }

    pending.push(...(node.children ?? []));
  }

  return undefined;
}
