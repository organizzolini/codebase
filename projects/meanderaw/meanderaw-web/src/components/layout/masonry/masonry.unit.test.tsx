import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Masonry } from "./masonry";

describe(Masonry, () => {
  it("applies its class name", () => {
    render(
      <Masonry
        className="masonry"
        columns={2}
      />,
    );

    expect(screen.getByTestId("masonry").className).toBe("masonry");
  });

  it("deals its children round-robin across the columns, so they read left to right", () => {
    render(
      <Masonry columns={3}>
        {["a", "b", "c", "d", "e"].map((id) => (
          <p key={id}>{id}</p>
        ))}
      </Masonry>,
    );

    expect(
      screen
        .getAllByTestId("masonry-column")
        .map((column) => column.textContent),
    ).toStrictEqual(["ad", "be", "c"]);
  });
});
