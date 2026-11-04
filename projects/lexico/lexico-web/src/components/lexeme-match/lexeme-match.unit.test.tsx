import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemeMatch } from "./lexeme-match";

describe(LexemeMatch, () => {
  it("applies its class name", () => {
    render(
      <LexemeMatch
        className="lexeme-match"
        match={{ kind: "exact-headword" }}
      />,
    );

    expect(screen.getByTestId("lexeme-match").className).toBe("lexeme-match");
  });

  it("shows a Latin icon and an exact icon for an exact headword match", () => {
    render(<LexemeMatch match={{ kind: "exact-headword" }} />);

    expect(screen.getByLabelText("Latin match")).toBeDefined();
    expect(screen.getByLabelText("Exact match")).toBeDefined();
  });

  it("shows an English icon for a match through a translation", () => {
    render(<LexemeMatch match={{ kind: "translation-prefix" }} />);

    expect(screen.getByLabelText("English match")).toBeDefined();
    expect(screen.getByLabelText("Starts with")).toBeDefined();
  });

  it("calls a match a few edits away fuzzy", () => {
    render(<LexemeMatch match={{ distance: 1, kind: "fuzzy" }} />);

    expect(screen.getByLabelText("Fuzzy match")).toBeDefined();
  });

  it("explains a fuzzy icon in a tooltip, with how many edits away the match is", async () => {
    render(<LexemeMatch match={{ distance: 2, kind: "fuzzy" }} />);

    fireEvent.focus(screen.getByLabelText("Fuzzy match"));

    await expect(
      screen.findByText(
        "Fuzzy match: A headword or form a few letters away from what you searched for (2 edits away)",
      ),
    ).resolves.toBeDefined();
  });

  it("explains a prefix icon in a tooltip, with how many letters it has beyond the query", async () => {
    render(<LexemeMatch match={{ extraLetters: 2, kind: "prefix" }} />);

    fireEvent.focus(screen.getByLabelText("Starts with"));

    await expect(
      screen.findByText(
        "Starts with: The headword starts with what you searched for (+2 letters)",
      ),
    ).resolves.toBeDefined();
  });
});
