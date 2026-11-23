import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoryList } from "./history-list";

vi.mock("../history-lexeme/history-lexeme", () => ({
  HistoryLexeme: ({ entry }: Readonly<{ entry: { word: string } }>) => (
    <div data-testid="history-lexeme">{entry.word}</div>
  ),
}));

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";

describe(HistoryList, () => {
  it("applies its class name", () => {
    render(
      <HistoryList
        className="history-list"
        emptyMessage=""
        entries={[]}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    expect(screen.getByTestId("history-list").className).toBe("history-list");
  });

  it("shows the empty message when there are no entries", () => {
    render(
      <HistoryList
        emptyMessage="Nothing yet."
        entries={[]}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    expect(screen.getByText("Nothing yet.").textContent).toBe("Nothing yet.");
  });

  const LOOKUP: HistoryEntry = {
    definition: "arms",
    form: "nominative plural",
    kind: "lookup",
    line: 0,
    recordedAt: 1,
    slug: "aeneid",
    token: 0,
    word: "Arma",
  };
  const SEARCH: HistoryEntry = { kind: "search", query: "arma", recordedAt: 2 };

  it("shows each lookup's lexeme card, and none for a search, when asked to", () => {
    render(
      <HistoryList
        emptyMessage=""
        entries={[LOOKUP, SEARCH]}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
        showLexemes
      />,
    );

    expect(screen.getAllByTestId("history-lexeme")).toHaveLength(1);
  });

  it("keeps the one-line summary, with no card, by default", () => {
    render(
      <HistoryList
        emptyMessage=""
        entries={[LOOKUP]}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    expect(screen.queryByTestId("history-lexeme")).toBeNull();
    expect(screen.getByText("arms")).toBeDefined();
  });
});
