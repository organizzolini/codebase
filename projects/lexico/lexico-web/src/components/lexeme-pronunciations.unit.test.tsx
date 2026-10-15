import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LexemePronunciations } from "./lexeme-pronunciations";

const pronunciations = [
  { phonetic: "[ˈa.moː]", variant: "classical" },
  { phonetic: "[ˈaː.mo]", variant: "ecclesiastical" },
];

describe(LexemePronunciations, () => {
  it("applies its class name", () => {
    render(
      <LexemePronunciations
        className="lexeme-pronunciations"
        pronunciations={pronunciations}
      />,
    );

    expect(screen.getByTestId("lexeme-pronunciations").className).toBe(
      "lexeme-pronunciations",
    );
  });

  it("shows each variant with its transcription", () => {
    render(<LexemePronunciations pronunciations={pronunciations} />);

    expect(screen.getByText("classical")).toBeDefined();
    expect(screen.getByText("[ˈa.moː]")).toBeDefined();
    expect(screen.getByText("[ˈaː.mo]")).toBeDefined();
  });

  it("shows nothing when no variant has a transcription", () => {
    render(<LexemePronunciations pronunciations={[]} />);

    expect(screen.queryByTestId("lexeme-pronunciations")).toBeNull();
  });
});
