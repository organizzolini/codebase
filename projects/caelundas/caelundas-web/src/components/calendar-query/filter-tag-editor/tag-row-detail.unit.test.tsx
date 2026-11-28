import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TagRowDetail } from "./tag-row-detail";

describe(TagRowDetail, () => {
  it("applies its class name", () => {
    render(
      <TagRowDetail
        className="tag-row-detail"
        item={{ label: "Mars", value: "mars" }}
        note="Drive"
      />,
    );

    expect(screen.getByTestId("tag-row-detail").className).toBe(
      "tag-row-detail",
    );
  });

  it("draws nothing for a tag with one parent and no note", () => {
    const { container } = render(
      <TagRowDetail
        item={{ label: "Mars", value: "mars" }}
        note={undefined}
      />,
    );

    expect(container.textContent).toBe("");
  });

  it("draws the note alone for a tag with one parent", () => {
    render(
      <TagRowDetail
        item={{ label: "Mars", value: "mars" }}
        note="The planet of drive"
      />,
    );

    expect(screen.getByText("The planet of drive")).toBeDefined();
    expect(screen.queryByTestId("tag-also-under")).toBeNull();
  });

  it("says where else a tag under two parents sits, before its note", () => {
    const { container } = render(
      <TagRowDetail
        item={{
          data: { alsoUnder: ["Body / Benefic"], depth: 2, name: "Venus" },
          label: "Venus",
          value: "venus",
        }}
        note="The planet of love"
      />,
    );

    expect(screen.getByTestId("tag-also-under").textContent).toBe(
      "also Benefic",
    );
    expect(container.textContent).toBe("also Benefic· The planet of love");
  });

  it("draws the cue alone when the tag has no note", () => {
    const { container } = render(
      <TagRowDetail
        item={{
          data: { alsoUnder: ["Body / Malefic"], depth: 2, name: "Mars" },
          label: "Mars",
          value: "mars",
        }}
        note={undefined}
      />,
    );

    expect(container.textContent).toBe("also Malefic");
  });
});
