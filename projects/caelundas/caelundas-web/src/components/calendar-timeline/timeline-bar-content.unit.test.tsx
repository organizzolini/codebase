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
});
