import { listKeys } from "../../calendar-skeleton.utilities";

import type { SkeletonTimelineRow } from "./skeleton-timeline.types";

// ♟️ Constants

/**
 * How far a group's pill indents per level, in rem.
 */
export const INDENT_REM = 0.75;

const SHAPES = [
  { bar: "w-1/3 ms-[5%]", depth: 0, width: "w-20" },
  { bar: "w-1/4 ms-[30%]", depth: 1, width: "w-24" },
  { bar: "w-2/5 ms-[10%]", depth: 2, width: "w-24" },
  { bar: "w-1/5 ms-[55%]", depth: 3, width: "w-28" },
  { bar: "w-1/3 ms-[20%]", depth: 3, width: "w-24" },
  { bar: "w-1/4 ms-[45%]", depth: 3, width: "w-24" },
  { bar: "w-1/2 ms-[8%]", depth: 3, width: "w-28" },
  { bar: "w-1/5 ms-[65%]", depth: 0, width: "w-20" },
] as const;

const ROW_KEYS = listKeys("row", 24);

/**
 * Group rows of varied depth, each with a bar in time.
 */
export const TIMELINE_ROWS: readonly SkeletonTimelineRow[] = ROW_KEYS.map(
  (id, index) => ({ ...(SHAPES[index % SHAPES.length] ?? SHAPES[0]), id }),
);

export const SCALE_KEYS = listKeys("day", 14);
