import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemeEtymology } from "./lexeme-etymology";

describe(LexemeEtymology, () => {
  it("applies its class name", () => {
    render(
      <LexemeEtymology
        className="lexeme-etymology"
        etymology="From Proto-Italic."
      />,
    );

    expect(screen.getByTestId("lexeme-etymology").className).toBe(
      "lexeme-etymology",
    );
  });

  it("keeps the text folded until the toggle is clicked", () => {
    render(<LexemeEtymology etymology="From Proto-Italic." />);

    expect(screen.queryByText("From Proto-Italic.")).toBeNull();

    fireEvent.click(screen.getByText("Etymology"));

    expect(screen.getByText("From Proto-Italic.")).toBeDefined();
  });

  it("shows nothing for an entry with no etymology", () => {
    render(<LexemeEtymology etymology={null} />);

    expect(screen.queryByTestId("lexeme-etymology")).toBeNull();
  });
});
