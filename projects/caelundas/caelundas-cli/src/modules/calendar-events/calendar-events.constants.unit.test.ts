import { describe, expect, it } from "vitest";

import { POSTGRES_MAXIMUM_PARAMETERS } from "../../caelundas-cli.constants";

import {
  CALENDAR_EVENT_BATCH_SIZE,
  CALENDAR_EVENT_INSERT_COLUMNS,
  CALENDAR_EVENT_TAG_BATCH_SIZE,
} from "./calendar-events.constants";

describe("calendar event batch sizes", () => {
  it("fills an event insert up to Postgres's parameter limit and no further", () => {
    const columns = CALENDAR_EVENT_INSERT_COLUMNS.length;

    expect(CALENDAR_EVENT_BATCH_SIZE * columns).toBeLessThanOrEqual(
      POSTGRES_MAXIMUM_PARAMETERS,
    );
    expect((CALENDAR_EVENT_BATCH_SIZE + 1) * columns).toBeGreaterThan(
      POSTGRES_MAXIMUM_PARAMETERS,
    );
  });

  it("fills a tag link insert, two parameters a row, up to the limit and no further", () => {
    expect(CALENDAR_EVENT_TAG_BATCH_SIZE * 2).toBeLessThanOrEqual(
      POSTGRES_MAXIMUM_PARAMETERS,
    );
    expect((CALENDAR_EVENT_TAG_BATCH_SIZE + 1) * 2).toBeGreaterThan(
      POSTGRES_MAXIMUM_PARAMETERS,
    );
  });
});
