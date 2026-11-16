/* cspell:words Mutatas virum */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReaderHistory } from "./reader-history";

import type {
  HistoryEntry,
  LookupEntry,
} from "../../hooks/use-lookup-history/use-lookup-history.types";

const ENTRY: LookupEntry = {
  definition: "arms",
  form: "nominative plural",
  kind: "lookup",
  line: 0,
  recordedAt: 1,
  slug: "vergil-aeneid-1",
  title: "Aeneid",
  token: 0,
  word: "Arma",
};

const OTHER_TEXT: LookupEntry = {
  ...ENTRY,
  slug: "ovid-metamorphoses-1",
  title: "Metamorphoses",
  word: "Mutatas",
};

const SEARCH: HistoryEntry = {
  kind: "search",
  query: "virum",
  recordedAt: 2,
};

describe(ReaderHistory, () => {
  it("applies its class name", () => {
    render(
      <ReaderHistory
        className="reader-history"
        currentSlug="vergil-aeneid-1"
        entries={[]}
        onClear={vi.fn<() => void>()}
        onFocusEntry={vi.fn<(entry: HistoryEntry | null) => void>()}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    expect(screen.getByTestId("reader-history").className).toBe(
      "reader-history",
    );
  });

  it("reports the entry the reader hovers", () => {
    const onFocusEntry = vi.fn<(entry: HistoryEntry | null) => void>();
    render(
      <ReaderHistory
        currentSlug="vergil-aeneid-1"
        entries={[ENTRY]}
        onClear={vi.fn<() => void>()}
        onFocusEntry={onFocusEntry}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.mouseEnter(screen.getByRole("button", { name: /^Arma/u }));

    expect(onFocusEntry).toHaveBeenLastCalledWith(ENTRY);
  });

  it("lists only this text's lookups in the This text tab", () => {
    render(
      <ReaderHistory
        currentSlug="vergil-aeneid-1"
        entries={[OTHER_TEXT, ENTRY, SEARCH]}
        onClear={vi.fn<() => void>()}
        onFocusEntry={vi.fn<(entry: HistoryEntry | null) => void>()}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "History" }));

    expect(screen.getByRole("button", { name: /^Arma/u })).toBeInstanceOf(
      HTMLElement,
    );
    expect(screen.queryByRole("button", { name: /^Mutatas/u })).toBeNull();
    expect(screen.queryByRole("button", { name: /^virum/u })).toBeNull();
  });

  it("lists every entry, labelled by origin, in the All tab", () => {
    render(
      <ReaderHistory
        currentSlug="vergil-aeneid-1"
        entries={[OTHER_TEXT, ENTRY, SEARCH]}
        onClear={vi.fn<() => void>()}
        onFocusEntry={vi.fn<(entry: HistoryEntry | null) => void>()}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.mouseDown(screen.getByRole("tab", { name: "All" }));
    fireEvent.click(screen.getByRole("tab", { name: "All" }));

    expect(
      screen.getByRole("button", { name: /^Mutatas.*Metamorphoses/u }),
    ).toBeInstanceOf(HTMLElement);
    expect(
      screen.getByRole("button", { name: /^virum.*Search/u }),
    ).toBeInstanceOf(HTMLElement);
  });

  it("opens the entry the reader clicks", () => {
    const onOpenEntry = vi.fn<(entry: HistoryEntry) => void>();
    render(
      <ReaderHistory
        currentSlug="vergil-aeneid-1"
        entries={[SEARCH]}
        onClear={vi.fn<() => void>()}
        onFocusEntry={vi.fn<(entry: HistoryEntry | null) => void>()}
        onOpenEntry={onOpenEntry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.mouseDown(screen.getByRole("tab", { name: "All" }));
    fireEvent.click(screen.getByRole("tab", { name: "All" }));
    fireEvent.click(screen.getByRole("button", { name: /^virum/u }));

    expect(onOpenEntry).toHaveBeenCalledWith(SEARCH);
  });

  it("clears the history", () => {
    const onClear = vi.fn<() => void>();
    render(
      <ReaderHistory
        currentSlug="vergil-aeneid-1"
        entries={[ENTRY]}
        onClear={onClear}
        onFocusEntry={vi.fn<(entry: HistoryEntry | null) => void>()}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear history" }));

    expect(onClear).toHaveBeenCalledExactlyOnceWith();
  });
});
