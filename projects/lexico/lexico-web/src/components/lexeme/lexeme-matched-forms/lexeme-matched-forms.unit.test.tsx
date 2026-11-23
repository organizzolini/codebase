/* cspell:words opusque */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemeMatchedForms } from "./lexeme-matched-forms";
import { matchForms } from "./lexeme-matched-forms.utilities";

import type { LexemeFormRow } from "../lexeme-forms/lexeme-forms.types";

const nominal = (
  word: string,
  case_: string,
  number = "singular",
): LexemeFormRow => ({
  case: case_,
  id: `${word}-${case_}-${number}`,
  kind: "NominalForm",
  number,
  word,
});
const opus = [
  nominal("opus", "nominative"),
  nominal("opus", "vocative"),
  nominal("opus", "accusative"),
  nominal("opera", "nominative", "plural"),
];

describe(LexemeMatchedForms, () => {
  it("applies its class name", () => {
    render(
      <LexemeMatchedForms
        className="lexeme-matched-forms"
        matches={matchForms(opus, "opus")}
      />,
    );

    expect(screen.getByTestId("lexeme-matched-forms").className).toBe(
      "lexeme-matched-forms",
    );
  });

  it("shows each matched form with its tags", () => {
    render(<LexemeMatchedForms matches={matchForms(opus, "opus")} />);

    expect(screen.getByText("opus")).toBeDefined();
    expect(screen.getAllByText("SG")).toHaveLength(3);
    expect(screen.getByText("VOC")).toBeDefined();
  });

  it("folds readings beyond the first few into a count", () => {
    render(<LexemeMatchedForms matches={matchForms(opus, "opus opera")} />);

    expect(screen.getByText("+1 more").getAttribute("title")).toBe(
      "opera nominative plural",
    );
  });

  it("shows the enclitic", () => {
    render(
      <LexemeMatchedForms
        enclitic="que"
        matches={matchForms(opus, "opusque", "que")}
      />,
    );

    expect(screen.getByText("+que")).toBeDefined();
  });

  it("shows nothing without matches or an enclitic", () => {
    render(<LexemeMatchedForms matches={[]} />);

    expect(screen.queryByTestId("lexeme-matched-forms")).toBeNull();
  });
});
