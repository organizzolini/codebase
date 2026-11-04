import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemeIdentifiers } from "./lexeme-identifiers";

describe(LexemeIdentifiers, () => {
  it("applies its class name", () => {
    render(
      <LexemeIdentifiers
        className="lexeme-identifiers"
        identifiers={["nominative singular"]}
      />,
    );

    expect(screen.getByTestId("lexeme-identifiers").className).toBe(
      "lexeme-identifiers",
    );
  });

  it("abbreviates each identifier and drops words with no short form", () => {
    render(
      <LexemeIdentifiers
        identifiers={["first person singular present active indicative"]}
      />,
    );

    expect(screen.getByText("1ST SG PRES ACT IND")).toBeDefined();
    expect(
      screen.getByLabelText("first person singular present active indicative"),
    ).toBeDefined();
  });

  it("shows the enclitic that was split off the searched word", () => {
    render(
      <LexemeIdentifiers
        enclitic="que"
        identifiers={[]}
      />,
    );

    expect(screen.getByText("+que")).toBeDefined();
  });

  it("shows nothing when there is nothing to say", () => {
    render(<LexemeIdentifiers identifiers={[]} />);

    expect(screen.queryByTestId("lexeme-identifiers")).toBeNull();
  });
});
