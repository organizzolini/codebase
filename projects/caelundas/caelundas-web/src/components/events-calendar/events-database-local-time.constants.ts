import type { LocalPart } from "./events-database-local-time.types";

// Canadian English writes dates in ISO order.
export const PART_OPTIONS: Readonly<
  Record<LocalPart, [string, Intl.DateTimeFormatOptions]>
> = {
  day: ["en-CA", { day: "2-digit", month: "2-digit", year: "numeric" }],
  hour: ["en-US", { hour: "2-digit", hourCycle: "h23" }],
};

export const formats = new Map<string, Intl.DateTimeFormat>();
