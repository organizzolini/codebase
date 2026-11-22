import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InflectionTag } from "./inflection-tag";

describe(InflectionTag, () => {
  it("applies its class name", () => {
    render(
      <InflectionTag
        className="inflection-tag"
        value="nominative"
      />,
    );

    expect(screen.getByTestId("inflection-tag").className).toBe(
      "inflection-tag",
    );
  });

  it("shows the short form and the full name on hover", () => {
    render(<InflectionTag value="futurePerfect" />);

    expect(screen.getByText("FUTP").getAttribute("title")).toBe(
      "future perfect",
    );
  });

  it("shows a value without a short form as written", () => {
    render(<InflectionTag value="gerund" />);

    expect(screen.getByText("gerund")).toBeDefined();
  });
});
