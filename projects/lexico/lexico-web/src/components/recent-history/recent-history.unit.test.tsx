/* cspell:words virum */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RecentHistory } from "./recent-history";

import type { HistoryEntry } from "../../hooks/use-lookup-history/use-lookup-history.types";

const SEARCH: HistoryEntry = { kind: "search", query: "virum", recordedAt: 1 };

describe(RecentHistory, () => {
  it("applies its class name", () => {
    render(
      <RecentHistory
        className="recent-history"
        entries={[SEARCH]}
        onClear={vi.fn<() => void>()}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    expect(screen.getByTestId("recent-history").className).toBe(
      "recent-history",
    );
  });

  it("shows nothing when there is no history", () => {
    const { container } = render(
      <RecentHistory
        className="recent-history"
        entries={[]}
        onClear={vi.fn<() => void>()}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    expect(container.textContent).toBe("");
  });

  it("lists recent entries and opens one when clicked", () => {
    const onOpenEntry = vi.fn<(entry: HistoryEntry) => void>();
    render(
      <RecentHistory
        className="recent-history"
        entries={[SEARCH]}
        onClear={vi.fn<() => void>()}
        onOpenEntry={onOpenEntry}
      />,
    );

    expect(screen.getByRole("heading", { name: "Recent" }).textContent).toBe(
      "Recent",
    );

    fireEvent.click(screen.getByRole("button", { name: /^virum/u }));

    expect(onOpenEntry).toHaveBeenCalledWith(SEARCH);
  });

  it("clears the history", () => {
    const onClear = vi.fn<() => void>();
    render(
      <RecentHistory
        className="recent-history"
        entries={[SEARCH]}
        onClear={onClear}
        onOpenEntry={vi.fn<(entry: HistoryEntry) => void>()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear history" }));

    expect(onClear).toHaveBeenCalledExactlyOnceWith();
  });
});
