import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TimelineBarCard } from "./timeline-bar-card";

import type { CalendarEventRecord } from "../../../events-calendar/components/calendar-loader/calendar-records.types";
import type { TimelineBar } from "../../calendar-timeline.types";
import type { GanttRenderEventProps } from "@codebase/presentation";

function occurrence(
  records: CalendarEventRecord[],
  title = "Title",
): GanttRenderEventProps<TimelineBar>["occurrence"] {
  return {
    end: new Date("2026-03-04T10:00:00Z"),
    event: { data: { records }, title },
    start: new Date("2026-03-04T10:00:00Z"),
  } as unknown as GanttRenderEventProps<TimelineBar>["occurrence"];
}

function record(id: string): CalendarEventRecord {
  const at = new Date("2026-03-04T10:00:00Z");

  return {
    color: null,
    description: "",
    durationMinutes: 0,
    end: at,
    groups: [],
    id,
    location: null,
    start: at,
    summary: `Event ${id}`,
    tags: [],
    timezone: "UTC",
  };
}

describe(TimelineBarCard, () => {
  it("applies its class name", () => {
    render(
      <TimelineBarCard
        className="timeline-bar-card"
        occurrence={occurrence([record("a")])}
      />,
    );

    expect(screen.getByTestId("calendar-event-card").className).toContain(
      "timeline-bar-card",
    );
  });

  it("says an event the way it is said everywhere", () => {
    render(<TimelineBarCard occurrence={occurrence([record("a")])} />);

    expect(screen.getByText("Event a")).toBeDefined();
  });

  it("says how many events a count stands for", () => {
    render(
      <TimelineBarCard occurrence={occurrence([record("a"), record("b")])} />,
    );

    expect(screen.getByText("2 events")).toBeDefined();
    expect(screen.getByText("Click to list them.")).toBeDefined();
  });

  it("says a bar's title when it holds no events", () => {
    render(<TimelineBarCard occurrence={occurrence([], "A row")} />);

    expect(screen.getByText("A row")).toBeDefined();
  });
});
