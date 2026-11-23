import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryLexeme } from "./history-lexeme";
import { getHistoryLexeme } from "./history-lexeme.constants";

import type { LookupEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";
import type { LexemeResult } from "../../lexeme/lexeme-card/lexeme-card.types";

vi.mock("./history-lexeme.constants", () => ({
  getHistoryLexeme: vi.fn<() => Promise<LexemeResult | null>>(),
  HISTORY_LEXEME_STATUS: {
    failed: "Could not load this entry.",
    loading: "Loading the entry…",
    missing: "This word is not in the dictionary.",
  },
}));

const ENTRY: LookupEntry = {
  definition: "arms",
  form: "nominative plural",
  kind: "lookup",
  lexemeId: "lexeme-arma",
  line: 0,
  recordedAt: 1,
  slug: "aeneid",
  token: 0,
  word: "Arma",
};
const RESULT: LexemeResult = {
  forms: [],
  id: "lexeme-arma",
  lemma: "arma",
  match: { kind: "exact-form" },
  matchedForms: [{ groups: [["nominative", "plural"]], text: "arma" }],
  partOfSpeech: "noun",
  principalParts: ["arma"],
  pronunciations: [],
  source: "WORD_EXACT",
  translations: ["arms"],
};

describe(HistoryLexeme, () => {
  beforeEach(() => {
    vi.mocked(getHistoryLexeme).mockReset();
  });

  it("applies its class name", () => {
    vi.mocked(getHistoryLexeme).mockReturnValue(
      new Promise<LexemeResult | null>(() => {}),
    );
    render(
      <HistoryLexeme
        className="history-lexeme"
        entry={ENTRY}
      />,
    );

    expect(screen.getByTestId("history-lexeme").className).toBe(
      "history-lexeme",
    );
  });

  it("asks for the recorded lexeme and form, then shows the search page's lexeme card", async () => {
    vi.mocked(getHistoryLexeme).mockResolvedValue(RESULT);
    render(<HistoryLexeme entry={ENTRY} />);

    await expect(screen.findByTestId("lexeme-card")).resolves.toBeDefined();
    expect(getHistoryLexeme).toHaveBeenCalledWith({
      data: {
        form: "nominative plural",
        lexemeId: "lexeme-arma",
        word: "Arma",
      },
    });
    expect(screen.getByText("arms")).toBeDefined();
  });

  it("looks an entry that kept no lexeme up by its word alone", async () => {
    vi.mocked(getHistoryLexeme).mockResolvedValue(RESULT);
    render(<HistoryLexeme entry={{ ...ENTRY, lexemeId: undefined }} />);

    await waitFor(() => {
      expect(getHistoryLexeme).toHaveBeenCalledWith({
        data: { form: null, lexemeId: null, word: "Arma" },
      });
    });
  });

  it("tells the reader while the entry loads", () => {
    vi.mocked(getHistoryLexeme).mockReturnValue(
      new Promise<LexemeResult | null>(() => {}),
    );
    render(<HistoryLexeme entry={ENTRY} />);

    expect(screen.getByRole("status").textContent).toBe("Loading the entry…");
  });

  it("says when the word is not in the dictionary", async () => {
    vi.mocked(getHistoryLexeme).mockResolvedValue(null);
    render(<HistoryLexeme entry={ENTRY} />);

    await expect(
      screen.findByText("This word is not in the dictionary."),
    ).resolves.toBeDefined();
  });

  it("says when the entry could not be loaded", async () => {
    vi.mocked(getHistoryLexeme).mockRejectedValue(new Error("offline"));
    render(<HistoryLexeme entry={ENTRY} />);

    await expect(
      screen.findByText("Could not load this entry."),
    ).resolves.toBeDefined();
  });
});
