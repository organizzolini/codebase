import { buildEventGroups } from "../calendar-group-by/event-group-tree.utilities";
import { getEventLabel } from "../event-glyphs/calendar-glyphs.utilities";

import { getVisibleTimelineRows } from "./calendar-timeline-window.utilities";
import {
  ALL_EVENTS_ROW,
  TIMELINE_VIEWPORT,
} from "./calendar-timeline.constants";

import type {
  EventGroupField,
  EventGrouping,
} from "../calendar-group-by/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/events-database.types";
import type { TimelineRowBox } from "./calendar-timeline-window.types";
import type {
  PendingGroup,
  RowLayout,
  TimelineBar,
  TimelineRows,
} from "./calendar-timeline.types";
import type {
  GanttColumn,
  GanttEvent,
  GanttResource,
} from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The tree panel's one extra column: how many distinct events each row
 * holds.
 */
export function toCountColumns(
  counts: ReadonlyMap<string, number>,
): GanttColumn[] {
  return [
    {
      align: "end",
      id: "events",
      render: (context) => counts.get(context.resource.id),
      title: "Events",
      width: 64,
    },
  ];
}

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
 * Reports the timeline body's visible rows once a frame at most, now and on
 * every scroll or resize of the body or its content, until the cleanup it
 * answers is called. The Gantt mounts its body after itself, so the body is
 * looked for again whenever the container's content changes.
 */
export function watchVisibleRows(
  container: HTMLElement,
  onChange: (visible: null | ReadonlySet<string>) => void,
): () => void {
  let frame = 0;
  let viewport: HTMLElement | null = null;
  const measure = (): void => {
    frame = 0;

    if (viewport !== null) {
      onChange(
        getVisibleTimelineRows(readRowBoxes(viewport), readViewport(viewport)),
      );
    }
  };
  const schedule = (): void => {
    frame ||= requestAnimationFrame(measure);
  };
  const resizes = new ResizeObserver(schedule);
  const attach = (): void => {
    // Most changes are the bars redrawn inside a body already found.
    if (viewport?.isConnected === true) {
      return;
    }

    const found = container.querySelector<HTMLElement>(TIMELINE_VIEWPORT);

    if (found === null) {
      return;
    }

    viewport?.removeEventListener("scroll", schedule);
    resizes.disconnect();
    viewport = found;
    viewport.addEventListener("scroll", schedule, { passive: true });
    resizes.observe(viewport);

    if (viewport.firstElementChild !== null) {
      resizes.observe(viewport.firstElementChild);
    }

    schedule();
  };
  const mutations = new MutationObserver(attach);

  mutations.observe(container, { childList: true, subtree: true });
  attach();

  return () => {
    cancelAnimationFrame(frame);
    mutations.disconnect();
    resizes.disconnect();
    viewport?.removeEventListener("scroll", schedule);
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
 * The timeline body's rows in order, each with its height as laid out.
 */
function readRowBoxes(viewport: HTMLElement): TimelineRowBox[] {
  return [...viewport.querySelectorAll<HTMLElement>("[data-gantt-row]")].map(
    (row) => ({
      height: row.getBoundingClientRect().height,
      id: row.dataset["ganttRowId"] ?? "",
    }),
  );
}

/**
 * How far the timeline body's first row has scrolled above its viewport's
 * top, past the axis drawn over it, and how tall the viewport is.
 */
function readViewport(viewport: HTMLElement): {
  scrollTop: number;
  viewportHeight: number;
} {
  const firstRow = viewport.querySelector<HTMLElement>("[data-gantt-row]");
  const top = viewport.getBoundingClientRect().top;

  return {
    scrollTop: top - (firstRow?.getBoundingClientRect().top ?? top),
    viewportHeight: viewport.clientHeight,
  };
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
