import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { GalleryView } from "./gallery-view";
import { DEFAULT_VIEW_STATE } from "./gallery-view.constants";

import type { GalleryViewProperties } from "./gallery-view";

/** The properties the strips need, over the fixture catalog and the default state. */
function properties(
  overrides: Partial<GalleryViewProperties> = {},
): GalleryViewProperties {
  return {
    characteristics: FIXTURE_CHARACTERISTICS,
    current: DEFAULT_VIEW_STATE,
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

  it("names the preset in force beside View, and the layout beside Display", () => {
    render(<GalleryView {...properties()} />);

    expect(screen.getByRole("group", { name: "View" }).textContent).toBe(
      "ViewDefault",
    );
    expect(screen.getByRole("group", { name: "Display" }).textContent).toBe(
      "DisplayGrid",
    );
  });

  it("says Custom when the options match no preset", () => {
    render(
      <GalleryView
        {...properties({
          current: { ...DEFAULT_VIEW_STATE, group: ["isChain"] },
        })}
      />,
    );

    expect(screen.getByRole("group", { name: "View" }).textContent).toBe(
      "ViewCustom",
    );
  });

  it("opens a cascader of presets with their descriptions from either segment, checking the one in force", async () => {
    render(<GalleryView {...properties()} />);
    fireEvent.click(screen.getByRole("button", { name: "Default" }));
    fireEvent.click(await screen.findByRole("option", { name: /Presets/u }));

    const options = await screen.findAllByRole("option");

    // Only the presets the fixture catalog can answer.
    expect(
      options.map((option) => option.getAttribute("aria-selected")),
    ).toStrictEqual(["true", "false"]);
    expect(
      screen.getByText("Group the meanders by rows, then by columns"),
    ).toBeDefined();
  });

  it("applies the whole of a preset pressed", async () => {
    const onApply = vi.fn<GalleryViewProperties["onApply"]>();

    render(<GalleryView {...properties({ onApply })} />);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(await screen.findByRole("option", { name: /Presets/u }));
    fireEvent.click(
      await screen.findByRole("option", { name: /By rows then columns/u }),
    );

    expect(onApply).toHaveBeenCalledExactlyOnceWith({
      ...DEFAULT_VIEW_STATE,
      group: ["rows", "columns"],
    });
  });

  it("offers a preset on a characteristic when the catalog holds it", async () => {
    render(
      <GalleryView
        {...properties({
          characteristics: [
            ...FIXTURE_CHARACTERISTICS,
            {
              category: "path",
              description: "Corners.",
              isPattern: false,
              key: "cornerCount",
              meanderCount: 0,
              name: "Corner Count",
              valueCounts: [],
              valueType: "number",
            },
          ],
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(await screen.findByRole("option", { name: /Presets/u }));

    await expect(
      screen.findByRole("option", { name: /Most corners first/u }),
    ).resolves.toBeDefined();
  });

  it("hands over the layout picked in the Display menu", async () => {
    const onApply = vi.fn<GalleryViewProperties["onApply"]>();

    render(<GalleryView {...properties({ onApply })} />);
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    fireEvent.click(await screen.findByRole("option", { name: /List/u }));

    expect(onApply).toHaveBeenCalledExactlyOnceWith({ view: "list" });
  });
});
