import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReaderHeader } from "./reader-header";

describe(ReaderHeader, () => {
  it("applies its class name", () => {
    render(
      <ReaderHeader
        author="Vergil"
        className="reader-header"
        parent={null}
      />,
    );

    expect(screen.getByTestId("reader-header").className).toBe("reader-header");
  });

  it("names the author and links the parent only when there is one", () => {
    render(
      <ReaderHeader
        author="Vergil"
        parent={null}
      />,
    );

    expect(screen.getByText("Vergil")).toBeDefined();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
