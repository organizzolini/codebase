import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarSymbolsContext } from "../../../../calendar-events/event-glyphs/calendar-symbols.constants";

import { TimelineRowLabel } from "./timeline-row-label";

describe(TimelineRowLabel, () => {
  it("leads the name with its symbol", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <TimelineRowLabel title="Moon" />
      </CalendarSymbolsContext>,
    );

    expect(screen.getByTestId("tag-lead").textContent).toBe("🌙");
    expect(screen.getByTestId("timeline-row-label").textContent).toContain(
      "Moon",
    );
  });

  it("draws nothing for a lane with no name", () => {
    render(<TimelineRowLabel title="" />);

    expect(screen.queryByTestId("tag-lead")).toBeNull();
  });
});
