import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NightSkySection } from "./night-sky-section";

describe(NightSkySection, () => {
  it("applies its class name", () => {
    render(
      <NightSkySection
        className="night-sky-section"
        title="Stars"
      />,
    );

    expect(screen.getByTestId("night-sky-section").className).toBe(
      "night-sky-section",
    );
  });

  it("opens and closes on its header, starting as it is told", () => {
    render(
      <NightSkySection
        defaultOpen={false}
        title="Constellations"
      >
        <p>The picker</p>
      </NightSkySection>,
    );

    const header = screen.getByRole("button", { name: "Constellations" });

    expect(header.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("The picker")).toBeNull();

    fireEvent.click(header);

    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("The picker")).toBeDefined();
  });
});
