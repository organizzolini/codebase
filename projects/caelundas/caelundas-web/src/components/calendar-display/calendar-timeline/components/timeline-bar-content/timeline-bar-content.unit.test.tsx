import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TimelineBarContent } from "./timeline-bar-content";

import type { TimelineBarContentProperties } from "./timeline-bar-content";

/**
 * A bar with no records behind it, which draws its title alone.
 */
function createOccurrence(): TimelineBarContentProperties["occurrence"] {
  return {
    end: new Date("2026-03-05T00:00:00.000Z"),
    event: { data: { names: [], records: [] }, title: "Mercury retrograde" },
    start: new Date("2026-03-04T00:00:00.000Z"),
  } as unknown as TimelineBarContentProperties["occurrence"];
}

describe(TimelineBarContent, () => {
  it("applies its class name", () => {
    render(
      <TimelineBarContent
        className="timeline-bar-content"
        occurrence={createOccurrence()}
      />,
    );

    expect(screen.getByTestId("timeline-bar-content").className).toBe(
      "timeline-bar-content",
    );
  });

  it("draws the title of a bar with no events behind it", () => {
    render(<TimelineBarContent occurrence={createOccurrence()} />);

    expect(screen.getByText("Mercury retrograde")).toBeDefined();
  });

  it("keeps the label of a span in view at either side of the viewport", () => {
    const occurrence = {
      end: new Date("2026-03-09T00:00:00.000Z"),
      event: {
        data: {
          names: ["Moon square Mars"],
          records: [
            {
              durationMinutes: 7200,
              end: new Date("2026-03-09T00:00:00.000Z"),
              groups: [],
              id: "span",
              name: "Moon square Mars",
              start: new Date("2026-03-04T00:00:00.000Z"),
              tags: [],
            },
          ],
        },
        title: "Moon square Mars",
      },
      start: new Date("2026-03-04T00:00:00.000Z"),
    } as unknown as TimelineBarContentProperties["occurrence"];

    render(<TimelineBarContent occurrence={occurrence} />);

    const label = screen.getByTestId("calendar-event-chip");

    expect(label.className).toContain("sticky");
    expect(label.className).toContain("start-1.5");
    expect(label.className).toContain("end-1.5");
  });
});
