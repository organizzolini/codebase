import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgendaRowContent } from "./agenda-row-content";

describe(AgendaRowContent, () => {
  it("applies its class name", () => {
    render(
      <AgendaRowContent
        className="agenda-row-content"
        dayLevel={0}
        onShowLater={undefined}
        row={{ kind: "later" }}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("agenda-row-content").className).toBe(
      "agenda-row-content",
    );
  });

  it("draws a day's heading in full", () => {
    render(
      <AgendaRowContent
        dayLevel={1}
        onShowLater={undefined}
        row={{ day: "2026-03-04", kind: "day" }}
        timeZone="UTC"
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 4,
        name: "Wednesday, March 4, 2026",
      }),
    ).toBeDefined();
  });

  it("lists later days from its button", () => {
    const onShowLater = vi.fn<() => void>();

    render(
      <AgendaRowContent
        dayLevel={0}
        onShowLater={onShowLater}
        row={{ kind: "later" }}
        timeZone="UTC"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show later events" }));

    expect(onShowLater).toHaveBeenCalledExactlyOnceWith(expect.anything());
  });
});
