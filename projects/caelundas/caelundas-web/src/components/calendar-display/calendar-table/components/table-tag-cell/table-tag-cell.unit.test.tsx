import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarSymbolsContext } from "../../../../calendar-events/event-glyphs/calendar-symbols.constants";
import { TagIconsContext } from "../../../../calendar-events/tag-pill-label/tag-pill-label.constants";

import { TableTagCell } from "./table-tag-cell";

import type { CalendarEventRecord } from "../../../events-calendar/components/calendar-loader/calendar-records.types";

const AT = new Date("2026-03-04T15:20:00.000Z");
const RECORD: CalendarEventRecord = {
  color: null,
  description: "",
  durationMinutes: 0,
  end: AT,
  groups: [],
  id: "event",
  location: null,
  start: AT,
  summary: "Event",
  tags: [
    { depth: 0, id: "body", name: "Body", path: "Body" },
    { depth: 1, id: "sun", name: "Sun", path: "Body / Sun" },
    { depth: 2, id: "venus", name: "Venus", path: "Body / Planet / Venus" },
    { depth: 1, id: "other", name: "Other", path: "Body / Other" },
  ],
  timezone: "UTC",
};

describe(TableTagCell, () => {
  it("applies its class name", () => {
    render(
      <TableTagCell
        className="table-tag-cell"
        prefix="Body"
        record={RECORD}
      />,
    );

    expect(screen.getByTestId("table-tag-cell").className).toContain(
      "table-tag-cell",
    );
  });

  it("draws a pill for each tag, named by its path past the prefix", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TableTagCell
          prefix="Body"
          record={RECORD}
        />
      </CalendarSymbolsContext>,
    );

    expect(
      screen.getAllByTestId("table-tag-pill").map((pill) => pill.textContent),
    ).toStrictEqual(["☀️Sun", "♀Planet / Venus", "Other"]);
  });

  it("draws the icon the facets gave a tag, beside its name", () => {
    render(
      <TagIconsContext value={new Map([["other", "globe"]])}>
        <TableTagCell
          prefix="Body"
          record={RECORD}
        />
      </TagIconsContext>,
    );

    const body = screen.getAllByTestId("table-tag-pill")[2];

    expect(body?.querySelector("[data-testid='tag-icon']")).not.toBeNull();
  });

  it("sits each tag in an opaque pill", () => {
    render(
      <TableTagCell
        prefix="Body"
        record={RECORD}
      />,
    );

    expect(screen.getAllByTestId("table-tag-pill")[0]?.className).toContain(
      "bg-background",
    );
  });

  it("draws nothing for a path the event has no tag beneath", () => {
    render(
      <TableTagCell
        prefix="Zodiac"
        record={RECORD}
      />,
    );

    expect(screen.queryByTestId("table-tag-pill")).toBeNull();
  });
});
