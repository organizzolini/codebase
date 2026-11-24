import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TagPillLabel } from "../tag-pill-label/tag-pill-label";

import { TagIconsProvider } from "./tag-icons-provider";

describe(TagIconsProvider, () => {
  it("applies its class name", () => {
    render(
      <TagIconsProvider
        className="tag-icons-provider"
        facets={[]}
      />,
    );

    expect(screen.getByTestId("tag-icons-provider").className).toBe(
      "tag-icons-provider",
    );
  });

  it("gives the pills beneath it the icons of the facets' tags", () => {
    render(
      <TagIconsProvider
        facets={[
          {
            id: "body",
            name: "Body",
            values: [
              {
                count: 1,
                depth: 1,
                icon: "sun",
                id: "sun",
                name: "Sun",
                path: "Sun",
              },
            ],
          },
        ]}
      >
        <TagPillLabel
          id="sun"
          label="Sun"
        />
      </TagIconsProvider>,
    );

    expect(
      screen
        .getByTestId("tag-pill-label")
        .querySelector("[data-testid='tag-icon']"),
    ).not.toBeNull();
  });
});
