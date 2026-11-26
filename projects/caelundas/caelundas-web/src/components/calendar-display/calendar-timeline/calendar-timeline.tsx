import { useEffect, useMemo, useState } from "react";

import { Gantt, GanttView } from "@codebase/presentation";

import { useBarDialog } from "../../../hooks/use-bar-dialog/use-bar-dialog";
import { useTimelineGroups } from "../../../hooks/use-timeline-tree/hooks/use-timeline-groups/use-timeline-groups";
import { useTimelineTree } from "../../../hooks/use-timeline-tree/use-timeline-tree";
import { createEventGroupFields } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { createTagRanks } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-sort.utilities";
import { DEFAULT_SORTS } from "../../calendar-query/calendar-sort-strip/calendar-sort-strip.constants";
import { VENDORED_SURFACE_CLASS_NAMES } from "../events-calendar/components/calendar-views/calendar-surfaces.constants";

import {
  COMPACT_TREE,
  DAY_VIEW_CLASS,
  DAY_ZOOM,
  LANE_ROWS,
  QUIET_VIEW_CLASS,
  renderBar,
  renderBarCard,
  TIMELINE_GANTT_PROPS,
  TREE,
  TREE_PANE_FIT,
  ZOOM,
} from "./calendar-timeline.constants";
import {
  toCountColumns,
  toTimelineRows,
  watchVisibleRows,
} from "./calendar-timeline.utilities";
import { createTimelineLayout } from "./components/timeline-lanes/calendar-timeline-lanes.utilities";
import { TimelineNavigation } from "./components/timeline-navigation/timeline-navigation";
import {
  isSameRowSet,
  windowTimelineBars,
} from "./components/timeline-window/calendar-timeline-window.utilities";

import type { CalendarNavigation } from "../../calendar-controls/calendar-navigation-group/calendar-navigation-group.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../events-calendar/components/calendar-loader/calendar-records.types";
import type { TimelineBar } from "./calendar-timeline.types";
import type { TimelineLayout } from "./components/timeline-lanes/calendar-timeline-lanes.types";
import type { GanttScale } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Events, row grouping, the shown period, and a navigation reporter.
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
   * The colors of the groups by tag id, for the rows' names; absent when colors are off.
   */
  groupColors?: ReadonlyMap<string, string> | undefined;
  /**
   * The levels the rows nest by, which the events' `groups` were read for.
   */
  grouping: readonly EventGroupLevel[];
  /**
   * Whether groups with no events are left out; shown when absent.
   */
  hideEmpty?: boolean | undefined;
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
  /**
   * How the rows are ordered, at every level; as built when absent.
   */
  sort?: readonly GroupSort[] | undefined;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders the events as a Gantt timeline: a row per group, instants as circles, spans as true-length bars, and clustered markers.
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
    groupColors,
    grouping,
    hideEmpty,
    onDateChange,
    onNavigationChange,
    scale = "month",
    sort,
    timeZone,
  } = properties;

  // 🪝 Hooks
  // The zoom belongs to the scale it was set at; another starts at rest.
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
  const rows = useMemo(
    () =>
      toTimelineRows(events, grouping, {
        fields: createEventGroupFields(facets),
        hideEmpty,
        ranks: createTagRanks(facets),
        sort: sort ?? DEFAULT_SORTS,
        tagColors: groupColors,
      }),
    [events, facets, groupColors, grouping, hideEmpty, sort],
  );
  const groups = useTimelineGroups(rows, grouping);
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
  const columns = useMemo(() => toCountColumns(rows.counts), [rows]);
  // The names column fits the widest row showing, so it follows every open and close.
  const tree = useTimelineTree(
    layout.resources,
    groups.collapsedGroups,
    compact ? COMPACT_TREE : TREE,
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  // The Gantt draws every bar it is handed, so only rows in view get theirs; rows keep one track each.
  // The body is measured on scroll and resize, which also catches a group collapsing or expanding.
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
      style={tree.style}
    >
      <Gantt<TimelineBar>
        {...TIMELINE_GANTT_PROPS}
        className={`h-full ${LANE_ROWS} ${VENDORED_SURFACE_CLASS_NAMES.ganttHeaders} ${VENDORED_SURFACE_CLASS_NAMES.ganttScrollbars} ${VENDORED_SURFACE_CLASS_NAMES.ganttTreePills} ${TREE_PANE_FIT}`}
        columns={columns}
        {...groups}
        date={anchor}
        events={shownBars}
        onDateChange={onDateChange}
        onEventClick={handleEventClick}
        onZoomChange={(next: number) => {
          setZoomed({ scale, zoom: next });
        }}
        renderEvent={renderBar}
        renderEventTooltip={renderBarCard}
        resources={layout.resources}
        scale={scale}
        timeZone={timeZone}
        treePanel={tree.panel}
        zoom={zoom}
        zoomRange={scale === "day" ? DAY_ZOOM : ZOOM}
      >
        <TimelineNavigation onNavigationChange={onNavigationChange} />
        <GanttView
          className={scale === "day" ? DAY_VIEW_CLASS : QUIET_VIEW_CLASS}
        />
      </Gantt>
      {dialog}
    </div>
  );
}
