import { useCallback, useEffect, useMemo, useState } from "react";

import { Gantt, GanttView } from "@codebase/presentation";

import { TIMELINE_DAY_INTERVAL } from "../constants/calendar-timeline-clusters.constants";
import { useBarDialog } from "../hooks/use-bar-dialog/use-bar-dialog";
import { createTimelineLayout } from "../utilities/calendar-timeline-lanes.utilities";
import {
  isSameRowSet,
  windowTimelineBars,
} from "../utilities/calendar-timeline-window.utilities";
import { toTimelineRows } from "../utilities/calendar-timeline.utilities";
import { createEventGroupFields } from "../utilities/event-group-fields.utilities";

import {
  COMPACT_TREE,
  DAY_ZOOM,
  INTERACTIONS,
  LANE_ROWS,
  QUIET_LABELS,
  TIMELINE_METRICS,
  TREE,
  ZOOM,
} from "./calendar-timeline.constants";
import {
  toCountColumns,
  watchVisibleRows,
} from "./calendar-timeline.utilities";
import { TimelineBarContent } from "./timeline-bar-content";
import { TimelineNavigation } from "./timeline-navigation";

import type { TimelineLayout } from "../types/calendar-timeline-lanes.types";
import type { TimelineBar } from "../types/calendar-timeline.types";
import type { EventGroupLevel } from "../types/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../types/events-database.types";
import type { CalendarNavigation } from "./calendar-navigation-group.types";
import type { GanttRenderEventProps, GanttScale } from "@codebase/presentation";
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
