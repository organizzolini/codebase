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

  it("calls a match on part of a word fuzzy", () => {
    render(<LexemeMatch match={{ extraLetters: 2, kind: "contains" }} />);

    expect(screen.getByLabelText("Fuzzy match")).toBeDefined();
  });

  it("explains an icon in a tooltip, with how many letters a partial match has beyond the query", async () => {
    render(<LexemeMatch match={{ extraLetters: 2, kind: "contains" }} />);

    fireEvent.focus(screen.getByLabelText("Fuzzy match"));

    await expect(
      screen.findByText(
        "Fuzzy match: The headword contains what you searched for (+2 letters)",
      ),
    ).resolves.toBeDefined();
  });
});
