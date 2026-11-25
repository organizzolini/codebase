import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarSymbolsContext } from "../../../../calendar-events/event-glyphs/calendar-symbols.constants";
import { TagIconsContext } from "../../../../calendar-events/tag-pill-label/tag-pill-label.constants";

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

  it("tints the name with its group's color", () => {
    render(
      <TimelineRowLabel
        color="rgb(255, 0, 0)"
        title="Moon"
      />,
    );

    expect(screen.getByText("Moon").getAttribute("style")).toContain(
      "rgb(255, 0, 0) 32%",
    );
  });

  it("leaves an uncolored name plain", () => {
    render(<TimelineRowLabel title="Moon" />);

    expect(screen.getByText("Moon").getAttribute("style")).toBeNull();
  });

  it("mutes the name of the events with no value", () => {
    render(
      <TimelineRowLabel
        title="No Aspect"
        fallback
      />,
    );

    expect(screen.getByText("No Aspect").className).toContain(
      "text-muted-foreground",
    );
  });

  it("leads each name with a symbol of its own", () => {
    render(
      <TagIconsContext value={new Map([["tag-1", "sun"]])}>
        <TimelineRowLabel
          tagId="tag-1"
          title="Unnamed"
        />
        <TimelineRowLabel
          icon="calendar"
          title="Other"
        />
      </TagIconsContext>,
    );

    expect(screen.getAllByTestId("tag-lead")).toHaveLength(2);
  });

  it("draws a group as a toggle button with its caret inside", () => {
    const onToggle = vi.fn();

    render(
      <TimelineRowLabel
        onToggle={onToggle}
        title="Simple"
      />,
    );

    const pill = screen.getByRole("button", { name: "Simple" });

    expect(pill.getAttribute("aria-expanded")).toBe("true");
    expect(pill.querySelector("svg")).not.toBeNull();

    fireEvent.click(pill);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("reports a closed group as collapsed", () => {
    render(
      <TimelineRowLabel
        onToggle={vi.fn()}
        title="Simple"
        collapsed
      />,
    );

    expect(
      screen
        .getByRole("button", { name: "Simple" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("draws a leaf with no button or caret", () => {
    render(<TimelineRowLabel title="Moon" />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("draws nothing for a lane with no name", () => {
    render(<TimelineRowLabel title="" />);

    expect(screen.queryByTestId("tag-lead")).toBeNull();
  });
});
