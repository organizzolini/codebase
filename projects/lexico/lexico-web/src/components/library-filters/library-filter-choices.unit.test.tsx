import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryFilterChoices } from "./library-filter-choices";

describe(LibraryFilterChoices, () => {
  it("applies its class name", () => {
    render(
      <LibraryFilterChoices
        className="library-filter-choices"
        draft={{ selected: {}, text: {} }}
        onText={vi.fn<(key: string, value: string) => void>()}
        onTick={vi.fn<
          (key: string, value: string, isTicked: boolean) => void
        >()}
      />,
    );

    expect(screen.getByTestId("library-filter-choices").className).toBe(
      "library-filter-choices",
    );
  });

  it("reports a ticked box and a typed list", () => {
    const onText = vi.fn<(key: string, value: string) => void>();
    const onTick =
      vi.fn<(key: string, value: string, isTicked: boolean) => void>();
    render(
      <LibraryFilterChoices
        draft={{ selected: {}, text: {} }}
        onText={onText}
        onTick={onTick}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Imperial" }));
    fireEvent.change(screen.getByLabelText("Materials"), {
      target: { value: "marble" },
    });

    expect(onTick).toHaveBeenCalledWith("eras", "IMPERIAL", true);
    expect(onText).toHaveBeenCalledWith("materials", "marble");
  });
});
