import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MeanderawLogo } from "./meanderaw-logo";

describe(MeanderawLogo, () => {
  it("applies its class name", () => {
    render(<MeanderawLogo className="meanderaw-logo" />);

    expect(screen.getByTestId("meanderaw-logo").className).toBe(
      "meanderaw-logo",
    );
  });

  it("is an image named Meanderaw, on the logo's 51 by 9 grid", () => {
    render(<MeanderawLogo />);

    const logo = screen.getByRole("img", { name: "Meanderaw" });

    expect(logo.getAttribute("viewBox")).toBe("0 0 51 9");
    // Its natural size keeps the 51 to 9 ratio, so no box letterboxes it.
    expect(logo.getAttribute("width")).toBe("51");
    expect(logo.getAttribute("height")).toBe("9");
  });

  it("strokes in the current text color with square caps", () => {
    render(<MeanderawLogo />);

    const path = screen
      .getByRole("img", { name: "Meanderaw" })
      .querySelector("path");

    expect(path?.getAttribute("stroke")).toBe("currentColor");
    expect(path?.getAttribute("stroke-linecap")).toBe("square");
  });
});
