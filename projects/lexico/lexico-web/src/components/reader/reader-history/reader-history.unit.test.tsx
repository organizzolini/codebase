/* cspell:words Mutatas virum */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReaderHistory } from "./reader-history";

vi.mock("../../history/history-lexeme/history-lexeme", () => ({
  HistoryLexeme: ({ entry }: Readonly<{ entry: { word: string } }>) => (
    <div data-testid="history-lexeme">{entry.word} card</div>
  ),
}));

import type {
  HistoryEntry,
  LookupEntry,
} from "../../../hooks/use-lookup-history/use-lookup-history.types";

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

/** The properties every test shares, with one overridable. */
function properties(
  overrides: Partial<Parameters<typeof ReaderHistory>[0]> = {},
): Parameters<typeof ReaderHistory>[0] {
  return {
    currentSlug: "vergil-aeneid-1",
    entries: [],
    isOpen: true,
    onClear: vi.fn<() => void>(),
    onClose: vi.fn<() => void>(),
    onFocusEntry: vi.fn<(entry: HistoryEntry | null) => void>(),
    onOpenEntry: vi.fn<(entry: HistoryEntry) => void>(),
    ...overrides,
  };
}

describe(ReaderHistory, () => {
  it("applies its class name", () => {
    render(
      <ReaderHistory
        className="reader-history"
        {...properties()}
      />,
    );

    expect(screen.getByTestId("reader-history").className).toBe(
      "reader-history",
    );
  });

  it("is a sidebar that pushes the page, not a dialog with a scrim", () => {
    render(<ReaderHistory {...properties()} />);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("complementary", { name: "History" }),
    ).toBeDefined();
  });

  it("renders nothing of its card while closed", () => {
    render(
      <ReaderHistory {...properties({ entries: [ENTRY], isOpen: false })} />,
    );

    expect(screen.queryByText("This text")).toBeNull();
    expect(
      screen.getByTestId("reader-history").querySelector("aside")?.dataset[
        "state"
      ],
    ).toBe("closed");
  });

  it("closes from its close button", () => {
    const onClose = vi.fn<() => void>();
    render(<ReaderHistory {...properties({ onClose })} />);

    fireEvent.click(screen.getByRole("button", { name: "Close history" }));

    expect(onClose).toHaveBeenCalledExactlyOnceWith();
  });

  it("reports the entry the reader hovers", () => {
    const onFocusEntry = vi.fn<(entry: HistoryEntry | null) => void>();
    render(
      <ReaderHistory {...properties({ entries: [ENTRY], onFocusEntry })} />,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: /^Arma/u }));

    expect(onFocusEntry).toHaveBeenLastCalledWith(ENTRY);
  });

  it("lists only this text's lookups in the This text tab, each with its lexeme card", () => {
    render(
      <ReaderHistory
        {...properties({ entries: [OTHER_TEXT, ENTRY, SEARCH] })}
      />,
    );

    expect(screen.getByRole("button", { name: /^Arma/u })).toBeInstanceOf(
      HTMLElement,
    );
    expect(screen.getByText("Arma card")).toBeDefined();
    expect(screen.queryByRole("button", { name: /^Mutatas/u })).toBeNull();
    expect(screen.queryByRole("button", { name: /^virum/u })).toBeNull();
  });

  it("lists every entry, labelled by origin, in the All tab", () => {
    render(
      <ReaderHistory
        {...properties({ entries: [OTHER_TEXT, ENTRY, SEARCH] })}
      />,
    );

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
      <ReaderHistory {...properties({ entries: [SEARCH], onOpenEntry })} />,
    );

    fireEvent.mouseDown(screen.getByRole("tab", { name: "All" }));
    fireEvent.click(screen.getByRole("tab", { name: "All" }));
    fireEvent.click(screen.getByRole("button", { name: /^virum/u }));

    expect(onOpenEntry).toHaveBeenCalledWith(SEARCH);
  });

  it("clears the history", () => {
    const onClear = vi.fn<() => void>();
    render(<ReaderHistory {...properties({ entries: [ENTRY], onClear })} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear history" }));

    expect(onClear).toHaveBeenCalledExactlyOnceWith();
  });
});
