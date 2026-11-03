import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventGlyphs } from "./event-glyphs";

describe(EventGlyphs, () => {
  it("applies its class name", () => {
    render(
      <EventGlyphs
        className="event-glyphs"
        glyphs="☿"
      />,
    );

    expect(screen.getByTestId("event-glyphs").className).toBe("event-glyphs");
  });

  it("draws an icon for each symbol and text for the rest", () => {
    const { container } = render(<EventGlyphs glyphs="♂️ ☌ ♀️ 🎯" />);

    expect(
      [...container.querySelectorAll<HTMLElement>("[data-icon]")].map(
        (icon) => icon.attributes.getNamedItem("data-icon")?.value,
      ),
    ).toStrictEqual([
      "mars-icon.svg",
      "conjunction-0-icon.png",
      "venus-icon.svg",
    ]);
    expect(screen.getByTestId("event-glyphs").textContent).toContain("🎯");
  });
});
