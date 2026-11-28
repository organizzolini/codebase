import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TagIcon } from "./tag-icon";

describe(TagIcon, () => {
  it("applies its class name", () => {
    render(
      <TagIcon
        className="tag-icon"
        name="moon"
      />,
    );

    expect(screen.getByTestId("tag-icon").className).toBe("tag-icon");
  });

  it("draws the lucide icon of the slug", async () => {
    expect.hasAssertions();

    const { container } = render(<TagIcon name="moon" />);

    await waitFor(() => {
      expect(container.querySelector("svg")).not.toBeNull();
    });
  });

  it("draws nothing for a slug lucide does not have", () => {
    expect.hasAssertions();

    const { container } = render(<TagIcon name="not-an-icon" />);

    expect(container.innerHTML).toBe("");
  });
});
