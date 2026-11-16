import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WordCard } from "./word-card";
import { getWordCandidates } from "./word-card.constants";

import type { WordCandidate, WordCardToken } from "./word-card.types";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: Readonly<{ children: string }>) => (
    <a href="/">{children}</a>
  ),
}));
vi.mock("./word-card.constants", () => ({
  getWordCandidates: vi.fn<() => Promise<WordCandidate[]>>(),
}));

const TOKEN: WordCardToken = {
  data: "Arma",
  id: "token-0",
  index: 0,
  isPunctuation: false,
};
const ARMA: WordCandidate = {
  definition: "arms",
  description: "nominative plural",
  lemma: "arma",
  lexemeId: "lexeme-arma",
  partOfSpeech: "noun",
};

describe(WordCard, () => {
  beforeEach(() => {
    vi.mocked(getWordCandidates).mockReset();
  });

  it("applies its class name", () => {
    render(
      <WordCard
        className="word-card"
        token={TOKEN}
      />,
    );

    expect(screen.getByTestId("word-card").className).toBe("word-card");
  });

  it("shows the word as its button label", () => {
    render(<WordCard token={TOKEN} />);

    expect(screen.getByRole("button", { name: "Arma" })).toBeDefined();
  });

  it("is a native button that keyboard focus reaches, and a click on it opens the card", async () => {
    vi.mocked(getWordCandidates).mockResolvedValue([ARMA]);
    render(<WordCard token={TOKEN} />);
    const word = screen.getByRole("button", { name: "Arma" });

    word.focus();

    expect(document.activeElement).toBe(word);
    expect(word.tabIndex).toBe(0);

    // jsdom sends no click for Enter on a focused button, as a browser does.
    fireEvent.click(word);

    await expect(screen.findByText("arms")).resolves.toBeDefined();
  });

  it("says the lookup failed, then shows the readings when the reader reopens it", async () => {
    vi.mocked(getWordCandidates)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([ARMA]);
    render(<WordCard token={TOKEN} />);
    const word = screen.getByRole("button", { name: "Arma" });

    fireEvent.click(word);

    await expect(
      screen.findByText(/Could not look up this word/u),
    ).resolves.toBeDefined();

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    fireEvent.click(word);

    await expect(screen.findByText("arms")).resolves.toBeDefined();
    expect(screen.queryByText(/Could not look up this word/u)).toBeNull();
  });

  it("tells the reader a lookup is under way until the readings arrive", async () => {
    vi.mocked(getWordCandidates).mockReturnValue(
      new Promise<WordCandidate[]>(() => {}),
    );
    render(<WordCard token={TOKEN} />);

    fireEvent.click(screen.getByRole("button", { name: "Arma" }));

    await expect(
      screen.findByText(/Looking up the word/u),
    ).resolves.toBeDefined();
  });
});
