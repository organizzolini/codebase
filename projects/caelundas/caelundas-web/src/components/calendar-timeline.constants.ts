import { TIMELINE_UNIT_WIDTHS } from "../constants/calendar-timeline-clusters.constants";

export const INTERACTIONS = { drag: false, resize: false, selectSlot: false };

// The Gantt draws a day's axis in columns of no fewer than fifteen minutes;
// zooming in a day as far as fifteen times spreads each minute over the
// width a column takes at rest, so moments a minute apart read apart.
export const DAY_ZOOM = { max: 15, min: 0.5, step: 0.5 };

export const ZOOM = { max: 3, min: 0.5, step: 0.25 };

// Beside a marker, a title runs into its neighbors' at any scale coarser than
// a day, so there titles are left to each bar's own label and only a day's
// are drawn.
// The lanes of one row read as one: the line between a row and the lane
// beneath it is not drawn.
export const LANE_ROWS =
  "[&_[data-slot=gantt-row-group]:has(+[data-gantt-row-id*='#'])]:border-b-transparent";

export const QUIET_LABELS = "[&_[data-slot=gantt-bar-label]]:hidden";

// The column widths the clusters are sized by, handed to the Gantt rather
// than left to its defaults, so the two always agree.
// The lanes are taller than the Gantt's own, to give the symbols room.
export const TIMELINE_METRICS = {
  laneHeight: 1.75,
  unitWidths: TIMELINE_UNIT_WIDTHS,
};

// A phone gives the row names a narrow column and the time the rest.
export const COMPACT_TREE = { minWidth: 120, nameColumnWidth: 104, width: 168 };

export const TREE = { nameColumnWidth: 208, width: 288 };

export const TIMELINE_VIEWPORT =
  '[data-slot="gantt-timeline-pane"] [data-slot="scroll-area-viewport"]';
