import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import {
  Gantt,
  type GanttColumn,
  type GanttOccurrence,
  type GanttRenderEventProps,
  type GanttScale,
  GanttView,
  useGanttNavigation,
} from "@codebase/presentation";

import { getEventLabel } from "../lib/calendar/calendar-glyphs";
import {
  type TimelineBar,
  toTimelineRows,
} from "../lib/calendar/calendar-timeline";
import {
  TIMELINE_DAY_INTERVAL,
  TIMELINE_UNIT_WIDTHS,
} from "../lib/calendar/calendar-timeline-clusters";
import {
  createTimelineLayout,
  type TimelineLayout,
} from "../lib/calendar/calendar-timeline-lanes";
import {
  getVisibleTimelineRows,
  isSameRowSet,
  type TimelineRowBox,
  windowTimelineBars,
} from "../lib/calendar/calendar-timeline-window";
import { createEventGroupFields } from "../lib/event-groups/event-group-fields";

import { CalendarClusterDialog } from "./calendar-cluster-dialog";
import { CalendarEventChip } from "./calendar-event-chip";
import { CalendarEventTooltip } from "./calendar-event-tooltip";

import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../lib/events-database/events-database.types";
import type { CalendarNavigation } from "./calendar-navigation-group";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events to lay out, how to group them into rows, the period shown, and
 * where to report how it moves.
 */
export interface CalendarTimelineProperties {
  anchor: Date;
  className?: string;
  /**
   * Narrows the row names for a phone, leaving the time more room.
   */
  compact?: boolean | undefined;
  events: readonly CalendarEventRecord[];
  /**
   * The tag roots the data has, which name the rows.
   */
  facets: readonly EventFacet[];
  /**
   * The levels the rows nest by, which the events' `groups` were read for.
   */
  grouping: readonly EventGroupLevel[];
  /**
   * Called with the new day when the toolbar moves the timeline.
   */
  onDateChange: (date: Date) => void;
  /**
   * Called with how the timeline moves, whenever that changes, for the
   * toolbar that sits above it.
   */
  onNavigationChange: (navigation: CalendarNavigation) => void;
  /**
   * The span the timeline shows at once, from a day in columns of minutes
   * to a year in months; a month when absent.
   */
  scale?: GanttScale;
  timeZone: string;
}

const INTERACTIONS = { drag: false, resize: false, selectSlot: false };

// The Gantt draws a day's axis in columns of no fewer than fifteen minutes;
// zooming in a day as far as fifteen times spreads each minute over the
// width a column takes at rest, so moments a minute apart read apart.
const DAY_ZOOM = { max: 15, min: 0.5, step: 0.5 };
const ZOOM = { max: 3, min: 0.5, step: 0.25 };

// Beside a marker, a title runs into its neighbors' at any scale coarser than
// a day, so there titles are left to each bar's own label and only a day's
// are drawn.
// The lanes of one row read as one: the line between a row and the lane
// beneath it is not drawn.
const LANE_ROWS =
  "[&_[data-slot=gantt-row-group]:has(+[data-gantt-row-id*='#'])]:border-b-transparent";

const QUIET_LABELS = "[&_[data-slot=gantt-bar-label]]:hidden";

// The column widths the clusters are sized by, handed to the Gantt rather
// than left to its defaults, so the two always agree.
const TIMELINE_METRICS = { unitWidths: TIMELINE_UNIT_WIDTHS };

// A phone gives the row names a narrow column and the time the rest.
const COMPACT_TREE = { minWidth: 120, nameColumnWidth: 104, width: 168 };
const TREE = { nameColumnWidth: 208, width: 288 };

const TIMELINE_VIEWPORT =
  '[data-slot="gantt-timeline-pane"] [data-slot="scroll-area-viewport"]';

// 🧩 Component

/**
 * Renders the events as a Gantt timeline: a row per group,
 * nested and collapsible as the grouping nests, each counting its distinct
 * events, with instants drawn as circles at their moment and spans as bars
 * of their true length. Markers that would overlap at the scale and zoom
 * shown are clustered into counts. Nothing on it can be moved or created.
 */
export function CalendarTimeline(
  properties: Readonly<CalendarTimelineProperties>,
): ReactNode {
  const {
    anchor,
    className,
    compact = false,
    events,
    facets,
    grouping,
    onDateChange,
    onNavigationChange,
    scale = "month",
    timeZone,
  } = properties;

  // 🪝 Hooks
  // The zoom belongs to the scale it was set at; another scale starts at
  // rest.
  const [zoomed, setZoomed] = useState({ scale, zoom: 1 });
  // The rows on screen, which alone are handed their bars, as last measured
  // for the rows then laid out; `null` until the body is laid out.
  const [measured, setMeasured] = useState<{
    layout: null | TimelineLayout;
    visible: null | ReadonlySet<string>;
  }>({ layout: null, visible: null });
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const { dialog, handleEventClick } = useBarDialog(timeZone);
  const zoom = zoomed.scale === scale ? zoomed.zoom : 1;
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const rows = useMemo(
    () => toTimelineRows(events, grouping, fields),
    [events, fields, grouping],
  );
  // Overlapping bars are moved into lanes, so nothing is drawn over anything.
  const layout = useMemo(
    () => createTimelineLayout(rows, { scale, zoom }),
    [rows, scale, zoom],
  );
  // A measure of other rows, such as before a regrouping, would leave the
  // new rows bare, so every row counts as visible until they are measured.
  const visibleRows = measured.layout === layout ? measured.visible : null;
  const shownBars = useMemo(
    () => windowTimelineBars(layout.bars, visibleRows),
    [layout, visibleRows],
  );
  const renderEvent = useCallback(
    (eventProperties: GanttRenderEventProps<TimelineBar>) => (
      <TimelineBarContent occurrence={eventProperties.occurrence} />
    ),
    [],
  );
  const columns = useMemo(() => toCountColumns(rows.counts), [rows]);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  // The Gantt draws every row and every bar it is handed, so only the rows
  // scrolled into view, and a few beyond, are handed theirs. Rows keep one
  // track each, so a row's height does not change as its bars come and go.
  // The body is measured on scroll, and on resize, which also catches a
  // group collapsing or expanding.
  useEffect(
    () =>
      container === null
        ? undefined
        : watchVisibleRows(container, (visible) => {
            setMeasured((previous) =>
              previous.layout === layout &&
              isSameRowSet(previous.visible, visible)
                ? previous
                : { layout, visible },
            );
          }),
    [container, layout],
  );

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      ref={setContainer}
      className={className}
      data-testid="calendar-timeline"
    >
      <Gantt<TimelineBar>
        barLabel="auto"
        className={`h-full ${LANE_ROWS}`}
        columns={columns}
        date={anchor}
        events={shownBars}
        infiniteScroll={false}
        initialCenter="anchor"
        interactions={INTERACTIONS}
        interval={TIMELINE_DAY_INTERVAL}
        metrics={TIMELINE_METRICS}
        onDateChange={onDateChange}
        onEventClick={handleEventClick}
        onZoomChange={(next: number) => {
          setZoomed({ scale, zoom: next });
        }}
        renderEvent={renderEvent}
        resources={layout.resources}
        rowCheckboxes={false}
        scale={scale}
        scheduleMode="single"
        summaryBars={false}
        timeZone={timeZone}
        treePanel={compact ? COMPACT_TREE : TREE}
        zoom={zoom}
        zoomRange={scale === "day" ? DAY_ZOOM : ZOOM}
      >
        <TimelineNavigation onNavigationChange={onNavigationChange} />
        <GanttView
          className={
            scale === "day"
              ? "min-h-0 flex-1 border-t"
              : `min-h-0 flex-1 border-t ${QUIET_LABELS}`
          }
        />
      </Gantt>
      {dialog}
    </div>
  );
}

/**
 * What opens when a marker is clicked: the events it holds, titled by their
 * count, or by the name of the one event.
 */
function describeBar(
  bar: TimelineBar | undefined,
): undefined | { records: readonly CalendarEventRecord[]; title: string } {
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
 * Draws what a bar holds: a circle for an instant, at its moment and never
 * narrower than a lane is tall; the count of a cluster of crowded markers, in a circle;
 * or a span's title.
 */
function TimelineBarContent(
  properties: Readonly<Pick<GanttRenderEventProps<TimelineBar>, "occurrence">>,
): ReactNode {
  const { occurrence } = properties;
  const records = occurrence.event.data?.records ?? [];
  const [record] = records;

  if (record === undefined) {
    return (
      <span className="truncate font-medium">{occurrence.event.title}</span>
    );
  }

  if (records.length > 1) {
    // A count says nothing of what is behind it, so it has a tooltip too.
    return (
      <CalendarEventTooltip
        className="flex w-full justify-center"
        event={record}
        label={{
          details: "Click to list them.",
          name: `${String(records.length)} events`,
        }}
      >
        <span
          className="flex h-4 min-w-4 items-center justify-center rounded-full border border-(--gantt-event-color) bg-background px-1 text-[10px] leading-none font-semibold tabular-nums"
          data-slot="timeline-cluster"
        >
          {records.length}
        </span>
      </CalendarEventTooltip>
    );
  }

  if (occurrence.start.getTime() === occurrence.end.getTime()) {
    // The circle says nothing of what the event is, so it has the tooltip.
    return (
      <CalendarEventTooltip
        className="flex"
        event={record}
      >
        <span
          className="block size-3.5 shrink-0 rounded-full border border-(--gantt-event-color) bg-(--gantt-event-color)/80"
          data-slot="timeline-instant"
          aria-hidden
        />
      </CalendarEventTooltip>
    );
  }

  return (
    <CalendarEventChip
      className="min-w-0 font-medium"
      event={record}
    />
  );
}

/**
 * Reports the timeline's own navigation, which only a child of the Gantt can
 * read, to the toolbar above it, and draws nothing.
 */
function TimelineNavigation(
  properties: Readonly<{
    onNavigationChange: (navigation: CalendarNavigation) => void;
  }>,
): ReactNode {
  const { onNavigationChange } = properties;
  const navigation = useGanttNavigation();

  // Before paint, so the toolbar never shows the title of the view before.
  // Every render reports, which ends there: the toolbar re-renders only when
  // the title it is handed differs.
  useLayoutEffect(() => {
    onNavigationChange(navigation);
  });

  return null;
}

/**
 * The tree panel's one extra column: how many distinct events each row
 * holds.
 */
function toCountColumns(counts: ReadonlyMap<string, number>): GanttColumn[] {
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
 * Holds the marker clicked and the dialog that lists its events: the handler
 * to give the Gantt, and the dialog to draw.
 */
function useBarDialog(timeZone: string): {
  dialog: ReactNode;
  handleEventClick: (occurrence: GanttOccurrence<TimelineBar>) => void;
} {
  const [opened, setOpened] = useState<{
    records: readonly CalendarEventRecord[];
    title: string;
  }>();

  return {
    dialog: createElement(CalendarClusterDialog, {
      members: opened?.records,
      onClose: () => {
        setOpened(undefined);
      },
      timeZone,
      title: opened?.title ?? "",
    }),
    handleEventClick: (occurrence) => {
      setOpened(describeBar(occurrence.event.data));
    },
  };
}

/**
 * Reports the timeline body's visible rows once a frame at most, now and on
 * every scroll or resize of the body or its content, until the cleanup it
 * answers is called. The Gantt mounts its body after itself, so the body is
 * looked for again whenever the container's content changes.
 */
function watchVisibleRows(
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
