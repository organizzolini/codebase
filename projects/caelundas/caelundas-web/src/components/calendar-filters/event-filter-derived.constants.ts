import { WEEKDAY_LABELS } from "./event-filters.constants";

export const HOURS = { maximum: 23, minimum: 0 } as const;

export const WEEKDAYS = {
  maximum: WEEKDAY_LABELS.length - 1,
  minimum: 0,
} as const;
