import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "./logo";

describe(Logo, () => {
  it("applies its class name", () => {
    render(<Logo className="logo" />);

    expect(screen.getByTestId("logo").className).toBe("logo");
  });

  it("draws the logo at the width asked for, four thirds as tall", () => {
    render(<Logo width={18} />);

    expect(screen.getByAltText("Lexico").getAttribute("height")).toBe("24");
  });
});
