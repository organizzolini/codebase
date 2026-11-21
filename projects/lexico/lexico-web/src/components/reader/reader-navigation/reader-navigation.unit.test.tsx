import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReaderNavigation } from "./reader-navigation";

describe(ReaderNavigation, () => {
  it("applies its class name", () => {
    render(
      <ReaderNavigation
        className="reader-navigation"
        next={null}
        previous={null}
      />,
    );

    expect(screen.getByTestId("reader-navigation").className).toBe(
      "reader-navigation",
    );
  });

  it("links to neither end when both are absent", () => {
    render(
      <ReaderNavigation
        next={null}
        previous={null}
      />,
    );

    expect(screen.queryByRole("link")).toBeNull();
  });
});
