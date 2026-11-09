import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageNotFound } from "./page-not-found";

describe(PageNotFound, () => {
  it("applies its class name", () => {
    render(<PageNotFound className="page-not-found" />);

    expect(screen.getByTestId("page-not-found").className).toBe(
      "page-not-found",
    );
  });

  it("says the page does not exist, and links back to the calendar", () => {
    render(<PageNotFound />);

    expect(screen.getByText("Page not found")).toBeDefined();
    expect(
      screen
        .getByRole("link", { name: "Back to the calendar" })
        .getAttribute("href"),
    ).toBe("/");
  });
});
