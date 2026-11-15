import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReaderHistory } from "./reader-history";

import type { LookupEntry } from "../../hooks/use-lookup-history/use-lookup-history.types";

const ENTRY: LookupEntry = {
  definition: "arms",
  form: "nominative plural",
  line: 0,
  recordedAt: 1,
  slug: "vergil-aeneid-1",
  token: 0,
  word: "Arma",
};

describe(ReaderHistory, () => {
  it("applies its class name", () => {
    render(
      <ReaderHistory
        className="reader-history"
        entries={[]}
        onClear={vi.fn<() => void>()}
        onFocusEntry={vi.fn<(entry: LookupEntry | null) => void>()}
      />,
    );

    expect(screen.getByTestId("reader-history").className).toBe(
      "reader-history",
    );
  });

  it("reports the entry the reader hovers", () => {
    const onFocusEntry = vi.fn<(entry: LookupEntry | null) => void>();
    render(
      <ReaderHistory
        entries={[ENTRY]}
        onClear={vi.fn<() => void>()}
        onFocusEntry={onFocusEntry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.mouseEnter(screen.getByRole("button", { name: /^Arma/u }));

    expect(onFocusEntry).toHaveBeenLastCalledWith(ENTRY);
  });
});
