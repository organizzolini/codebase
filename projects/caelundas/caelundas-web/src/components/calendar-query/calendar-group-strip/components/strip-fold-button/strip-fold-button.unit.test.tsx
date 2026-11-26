import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StripFoldButton } from "./strip-fold-button";

describe(StripFoldButton, () => {
  it("counts the facets folded away, and lists their names in its tooltip", () => {
    render(
      <StripFoldButton
        names={["Name", "Start", "End"]}
        onUnfold={vi.fn<() => void>()}
        title="Select"
      />,
    );

    const button = screen.getByRole("button", { name: /3 Facets/u });

    expect(button.textContent).toBe("3 Facets");
    expect(button.getAttribute("title")).toBe("Name, Start, End");
  });

  it("says Facet for one", () => {
    render(
      <StripFoldButton
        names={["Name"]}
        onUnfold={vi.fn<() => void>()}
        title="Select"
      />,
    );

    expect(screen.getByTestId("strip-fold-button").textContent).toBe("1 Facet");
  });

  it("is named for what it unfolds, and says it is collapsed", () => {
    render(
      <StripFoldButton
        names={["Name", "Start"]}
        onUnfold={vi.fn<() => void>()}
        title="Select"
      />,
    );

    const button = screen.getByTestId("strip-fold-button");

    expect(button.getAttribute("aria-label")).toBe("2 Facets, unfold Select");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("unfolds when pressed", () => {
    const onUnfold = vi.fn<() => void>();

    render(
      <StripFoldButton
        names={["Name", "Start"]}
        onUnfold={onUnfold}
        title="Select"
      />,
    );

    fireEvent.click(screen.getByTestId("strip-fold-button"));

    expect(onUnfold).toHaveBeenCalledTimes(1);
  });
});
