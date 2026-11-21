import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoryCard } from "./history-card";

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";

const LOOKUP: HistoryEntry = {
  definition: "weapons",
  form: "nominative plural",
  kind: "lookup",
  line: 1,
  recordedAt: 3,
  slug: "aeneid-1",
  title: "Aeneid, Book 1",
  token: 0,
  word: "Arma",
};
const SEARCH: HistoryEntry = { kind: "search", query: "amo", recordedAt: 2 };
const TEXT: HistoryEntry = {
  authorName: "Julius Caesar",
  kind: "text",
  recordedAt: 1,
  slug: "text-1",
  title: "De Bello Gallico",
};

describe(HistoryCard, () => {
  it("applies its class name", () => {
    render(
      <HistoryCard
        className="history-card"
        entry={SEARCH}
        onOpen={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByTestId("history-card").className).toBe("history-card");
  });

  it("shows a word lookup with its form, translation, and source text", () => {
    render(
      <HistoryCard
        entry={LOOKUP}
        onOpen={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText("Arma")).toBeDefined();
    expect(screen.getByText("Word")).toBeDefined();
    expect(screen.getByText(/nominative plural/u)).toBeDefined();
    expect(screen.getByText("weapons. From Aeneid, Book 1")).toBeDefined();
  });

  it("shows a search with its term", () => {
    render(
      <HistoryCard
        entry={SEARCH}
        onOpen={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText("Search")).toBeDefined();
    expect(screen.getByText("Searched for amo")).toBeDefined();
  });

  it("shows a text opening with its title and author", () => {
    render(
      <HistoryCard
        entry={TEXT}
        onOpen={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText("Text")).toBeDefined();
    expect(
      screen.getByText("Opened De Bello Gallico by Julius Caesar"),
    ).toBeDefined();
  });

  it("opens its entry from the button", () => {
    const onOpen = vi.fn<(entry: HistoryEntry) => void>();
    render(
      <HistoryCard
        entry={TEXT}
        onOpen={onOpen}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open De Bello Gallico" }),
    );

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(TEXT);
  });
});
