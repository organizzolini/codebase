import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoryList } from "./history-list";

import type { HistoryEntry } from "../../hooks/use-lookup-history/use-lookup-history.types";

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
});
