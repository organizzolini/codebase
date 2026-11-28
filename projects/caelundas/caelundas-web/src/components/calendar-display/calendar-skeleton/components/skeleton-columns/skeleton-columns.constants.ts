import { listKeys } from "../../calendar-skeleton.utilities";

import type { SkeletonSlot } from "./skeleton-columns.types";

// ♟️ Constants

/**
 * The height of an hour, in rem.
 */
export const HOUR_REM = 3;

export const HOUR_KEYS = listKeys("hour", 14);

/**
 * The events of four kinds of day.
 */
export const DAY_SLOTS: readonly (readonly SkeletonSlot[])[] = [
  [
    { hours: 1, start: 7 },
    { hours: 1.5, start: 11 },
  ],
  [
    { hours: 1, start: 4 },
    { hours: 1, start: 8 },
    { hours: 2, start: 10 },
  ],
  [
    { hours: 1, start: 5 },
    { hours: 1, start: 9 },
  ],
  [{ hours: 1.5, start: 6 }],
];
