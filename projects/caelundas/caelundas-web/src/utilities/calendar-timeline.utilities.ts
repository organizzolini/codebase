import { ALL_EVENTS_ROW } from "../constants/calendar-timeline.constants";

import { getEventLabel } from "./calendar-glyphs.utilities";
import { buildEventGroups } from "./event-group-tree.utilities";

import type {
  PendingGroup,
  RowLayout,
  TimelineBar,
  TimelineRows,
} from "../types/calendar-timeline.types";
import type {
  EventGroupField,
  EventGrouping,
} from "../types/event-groups.types";
import type { CalendarEventRecord } from "../types/events-database.types";
import type { GanttEvent, GanttResource } from "@codebase/presentation";

/**
 * Lays events out as Gantt rows by a grouping. Each group becomes a row,
 * nested under the group above it; a tag group grouped below its root's
 * children is also nested under each tag between, so grouping by Conjunct
 * draws Aspect, then Major Aspect, then Conjunct, each collapsible. An event
 * is drawn once in every innermost row it falls in, and each row counts its
 * distinct events. Instants keep no length, which the Gantt draws as a
 * circle at its moment; spans keep their true length.
 */
export function toTimelineRows(
  events: readonly CalendarEventRecord[],
  grouping: EventGrouping,
  fields: readonly EventGroupField[],
): TimelineRows {
  if (grouping.length === 0) {
    return {
      counts: new Map([[ALL_EVENTS_ROW.id, events.length]]),
      events: events.map((record) => toGanttEvent(record, ALL_EVENTS_ROW.id)),
      resources: [{ ...ALL_EVENTS_ROW }],
    };
  }

  const resources: GanttResource[] = [];
  const layout: RowLayout = { children: new Map(), members: new Map() };
  const bars: GanttEvent<TimelineBar>[] = [];
  // Depth first without recursion, so the stack stays flat.
  const pending: PendingGroup[] = buildEventGroups(events, grouping, fields)
    .toReversed()
    .map((node) => ({ node, parent: { children: resources, id: "" } }));

  for (let group = pending.pop(); group !== undefined; group = pending.pop()) {
    const row = placeGroupRows(group, layout);

    if (group.node.children.length === 0) {
      bars.push(
        ...group.node.events.map((record) => toGanttEvent(record, row.id)),
      );
    } else {
      pending.push(
        ...group.node.children
          .toReversed()
          .map((node) => ({ node, parent: row })),
      );
    }
  }

  return {
    counts: new Map(
      [...layout.members.entries()].map(([id, ids]) => [id, ids.size] as const),
    ),
    events: bars,
    resources,
  };
}

/**
 * Finds or adds the rows of one group's path under its parent, the group's
 * own row last, noting the group's events as members of each, and answers
 * the group's own row's id and the list rows nested in it go in. A row with
 * nothing nested keeps an empty list, which the Gantt draws as a plain row.
 */
function placeGroupRows(
  group: PendingGroup,
  layout: RowLayout,
): PendingGroup["parent"] {
  const { node, parent } = group;
  let row = parent;

  for (const [index, name] of node.path.entries()) {
    const id = `${parent.id}/${String(node.level)}:${node.path.slice(0, index + 1).join(" / ")}`;
    let children = layout.children.get(id);
    const ids = layout.members.get(id) ?? new Set<string>();

    if (children === undefined) {
      children = [];
      row.children.push({ children, id, title: name });
      layout.children.set(id, children);
    }

    for (const record of node.events) {
      ids.add(record.id);
    }

    layout.members.set(id, ids);
    row = { children, id };
  }

  return row;
}

/**
 * One event drawn in one row: read-only, colored as the data colors it,
 * and carrying its record for the bar to render.
 */
function toGanttEvent(
  record: CalendarEventRecord,
  rowId: string,
): GanttEvent<TimelineBar> {
  return {
    data: { names: [getEventLabel(record).name], records: [record] },
    end: record.end,
    id: `${rowId}|${record.id}`,
    readOnly: true,
    resourceId: rowId,
    start: record.start,
    title: getEventLabel(record).glyphs,
    ...(record.color === null ? {} : { color: record.color }),
  };
}
