import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_FILTER_LINK } from "../gallery-filters/components/filter-query/filter-query.constants";

import { GalleryView } from "./gallery-view";

import type { GalleryViewProperties } from "./gallery-view";
import type { ViewState } from "./gallery-view.types";

const STATE: ViewState = {
  direction: "asc",
  group: [],
  link: DEFAULT_FILTER_LINK,
  sort: undefined,
  view: "list",
};

/** The properties the control needs, over the default state. */
function properties(
  overrides: Partial<GalleryViewProperties> = {},
): GalleryViewProperties {
  return {
    current: STATE,
    onApply: vi.fn<GalleryViewProperties["onApply"]>(),
    ...overrides,
  };
}

describe(GalleryView, () => {
  it("applies its class name", () => {
    render(
      <GalleryView
        {...properties()}
        className="gallery-view"
      />,
    );

    expect(screen.getByTestId("gallery-view").className).toBe("gallery-view");
  });

  it("names the view in force beside the View button", () => {
    render(<GalleryView {...properties()} />);

    expect(screen.getByRole("group", { name: "View" }).textContent).toBe(
      "ViewList",
    );
  });

  it("opens a cascader of Layout and Presets, each view with its description and a check on those in force", async () => {
    render(<GalleryView {...properties()} />);
    fireEvent.click(screen.getByRole("button", { name: "View" }));

    const parents = await screen.findAllByRole("option");

    expect(parents.map((option) => option.textContent)).toStrictEqual([
      expect.stringContaining("Layout"),
      expect.stringContaining("Presets"),
    ]);

    fireEvent.click(screen.getByRole("option", { name: /Layout/u }));

    const layouts = screen.getAllByRole("option");

    expect(
      layouts.map((option) => option.getAttribute("aria-selected")),
    ).toStrictEqual(["false", "true"]);
    expect(screen.getByText("Cards in a list, one to a row")).toBeDefined();
  });

  it("applies the view pressed", async () => {
    const onApply = vi.fn<GalleryViewProperties["onApply"]>();

    render(<GalleryView {...properties({ onApply })} />);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(await screen.findByRole("option", { name: /Presets/u }));
    fireEvent.click(
      await screen.findByRole("option", { name: /By rows then columns/u }),
    );

    expect(onApply).toHaveBeenCalledExactlyOnceWith({
      group: ["rows", "columns"],
    });
  });
});
