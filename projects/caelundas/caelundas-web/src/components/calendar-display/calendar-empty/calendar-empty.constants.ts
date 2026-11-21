import type { PlainEmptiness } from "./calendar-empty.types";

// ♟️ Constants

export const EMPTY_TITLES: Readonly<
  Record<PlainEmptiness, (period: string) => string>
> = {
  database: () => "No events yet",
  filter: () => "No events match the filters",
  match: (period) => `No events ${period}`,
};

export const EMPTY_DESCRIPTIONS: Readonly<
  Record<PlainEmptiness, (period: string) => string>
> = {
  database: () => "The events database is empty.",
  filter: (period) =>
    `Nothing ${period} passes the filters; change or clear them.`,
  match: (period) => `Nothing in the data falls ${period}.`,
};
