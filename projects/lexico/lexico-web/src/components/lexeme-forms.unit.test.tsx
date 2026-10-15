import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LexemeForms } from "./lexeme-forms";

import type { LexemeFormRow, LoadLexemeForms } from "./lexeme-forms";

const nominal: LexemeFormRow[] = [
  {
    case: "nominative",
    id: "1",
    kind: "NominalForm",
    number: "singular",
    word: "rosa",
  },
  {
    case: "genitive",
    id: "2",
    kind: "NominalForm",
    number: "singular",
    word: "rosae",
  },
];

/**
 * A loader that answers with the given rows.
 */
function loader(
  rows: LexemeFormRow[],
): ReturnType<typeof vi.fn<LoadLexemeForms>> {
  return vi.fn<LoadLexemeForms>().mockResolvedValue(rows);
}

describe(LexemeForms, () => {
  it("applies its class name", () => {
    render(
      <LexemeForms
        className="lexeme-forms"
        lexemeId="1"
        loadForms={loader([])}
        partOfSpeech="noun"
      />,
    );

    expect(screen.getByTestId("lexeme-forms").className).toBe("lexeme-forms");
  });

  it("does not load the forms until it is opened, and only once", async () => {
    const loadForms = loader(nominal);
    render(
      <LexemeForms
        lexemeId="1"
        loadForms={loadForms}
        partOfSpeech="noun"
      />,
    );

    expect(loadForms).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("declension"));

    await expect(screen.findByText("rosae")).resolves.toBeDefined();

    fireEvent.click(screen.getByText("declension"));
    fireEvent.click(screen.getByText("declension"));

    expect(loadForms).toHaveBeenCalledExactlyOnceWith("1");
  });

  it("calls a verb's table a conjugation", () => {
    render(
      <LexemeForms
        lexemeId="1"
        loadForms={loader([])}
        partOfSpeech="verb"
      />,
    );

    expect(screen.getByText("conjugation")).toBeDefined();
  });

  it("offers to try again when loading fails", async () => {
    const loadForms = vi
      .fn<LoadLexemeForms>()
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce(nominal);
    render(
      <LexemeForms
        lexemeId="1"
        loadForms={loadForms}
        partOfSpeech="noun"
      />,
    );

    fireEvent.click(screen.getByText("declension"));
    fireEvent.click(await screen.findByText("Try again"));

    await expect(screen.findByText("rosa")).resolves.toBeDefined();
    expect(loadForms).toHaveBeenCalledTimes(2);
  });

  it("says so when a lexeme has no forms on record", async () => {
    render(
      <LexemeForms
        lexemeId="1"
        loadForms={loader([])}
        partOfSpeech="noun"
      />,
    );

    fireEvent.click(screen.getByText("declension"));

    await expect(
      screen.findByText("No forms on record."),
    ).resolves.toBeDefined();
  });

  it("shows nothing for a part of speech with no table", () => {
    render(
      <LexemeForms
        lexemeId="1"
        loadForms={loader([])}
        partOfSpeech="preposition"
      />,
    );

    expect(screen.queryByTestId("lexeme-forms")).toBeNull();
  });
});
