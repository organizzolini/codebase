import type { TimelineRows } from "../../../../components/calendar-display/calendar-timeline/calendar-timeline.types";
import type { TimelineGroupList } from "./use-timeline-groups.types";
import type { GanttResource } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The group rows that are closed: every one not open.
 */
export function getCollapsedIds(
  groupIds: readonly string[],
  expanded: ReadonlySet<string>,
): string[] {
  return groupIds.filter((id) => !expanded.has(id));
}

/**
 * The ids in one list and not the other, which a toggle of the rows changed.
 */
export function getToggledIds(
  before: readonly string[],
  after: readonly string[],
): string[] {
  const kept = new Set(before);
  const next = new Set(after);

  return [
    ...before.filter((id) => !next.has(id)),
    ...after.filter((id) => !kept.has(id)),
  ];
}

/**
 * The group rows of a timeline, their levels, and the first path down them: the first group at each level.
 */
export function listTimelineGroups(rows: TimelineRows): TimelineGroupList {
  const groupIds: string[] = [];
  const groupLevels: number[] = [];

  for (const [id, group] of rows.groups) {
    groupIds.push(id);
    groupLevels.push(group.level);
  }

  const firstPath: string[] = [];

  for (
    let row: GanttResource | undefined = rows.resources[0];
    row !== undefined && rows.groups.has(row.id);
    row = row.children?.[0]
  ) {
    firstPath.push(row.id);
  }

  return { firstPath, groupIds, groupLevels };
}
