import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchLanding } from "./search-landing";

describe(SearchLanding, () => {
  it("applies its class name", () => {
    render(<SearchLanding className="search-landing" />);

    expect(screen.getByTestId("search-landing").className).toBe(
      "search-landing",
    );
  });

  it("shows the logo", () => {
    render(<SearchLanding />);

    expect(screen.getByRole("img", { name: "Lexico" })).toBeDefined();
  });
});
