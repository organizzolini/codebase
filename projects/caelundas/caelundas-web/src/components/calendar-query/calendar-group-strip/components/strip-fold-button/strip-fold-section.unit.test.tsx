import { fireEvent, render, screen } from "@testing-library/react";
import { use } from "react";
import { describe, expect, it, vi } from "vitest";

import { StripFoldContext } from "./strip-fold-button.constants";
import { StripFoldSection } from "./strip-fold-section";

import type { StripFold } from "./strip-fold-button.types";
import type { ReactNode } from "react";

/**
 * A chip whose Fold does what the strip's does.
 */
function Chip(): ReactNode {
  const onFold = use(StripFoldContext);

  return (
    <button
      onClick={onFold}
      type="button"
    >
      Chip
    </button>
  );
}

function createFold(isFolded: boolean): StripFold {
  return {
    isFolded,
    onFold: vi.fn<() => void>(),
    onUnfold: vi.fn<() => void>(),
  };
}

describe(StripFoldSection, () => {
  it("draws its chips, which fold the strip, while unfolded", () => {
    const fold = createFold(false);

    render(
      <StripFoldSection
        fold={fold}
        names={["Chip"]}
        title="Select"
      >
        <Chip />
      </StripFoldSection>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Chip" }));

    expect(screen.queryByTestId("strip-fold-button")).toBeNull();
    expect(fold.onFold).toHaveBeenCalledTimes(1);
  });

  it("draws the count in their place once folded, which unfolds the strip", () => {
    const fold = createFold(true);

    render(
      <StripFoldSection
        fold={fold}
        names={["Chip", "Other"]}
        title="Select"
      >
        <Chip />
      </StripFoldSection>,
    );

    expect(screen.queryByRole("button", { name: "Chip" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /2 Facets/u }));

    expect(fold.onUnfold).toHaveBeenCalledTimes(1);
  });

  it("draws its chips when there is nothing to fold or no fold", () => {
    const { rerender } = render(
      <StripFoldSection
        fold={createFold(true)}
        names={[]}
        title="Select"
      >
        <Chip />
      </StripFoldSection>,
    );

    expect(screen.getByRole("button", { name: "Chip" })).toBeDefined();

    rerender(
      <StripFoldSection
        fold={undefined}
        names={["Chip"]}
        title="Select"
      >
        <Chip />
      </StripFoldSection>,
    );

    expect(screen.getByRole("button", { name: "Chip" })).toBeDefined();
  });
});
