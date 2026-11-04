import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import {
  FilterDateRangeEditor,
  type FilterDateRangeEditorProperties,
} from "./filter-date-range-editor";

/**
 * The properties the builder hands the editor, with spies for its callbacks.
 */
function createProperties(
  value?: unknown,
): Omit<FilterDateRangeEditorProperties, "className"> {
  return {
    autoFocusProps: { autoFocus: false, ref: vi.fn<() => void>() },
    back: vi.fn<() => void>(),
    cancel: vi.fn<() => void>(),
    commit: vi.fn<() => void>(),
    field: { id: "date", label: "Date" },
    host: "create",
    labels: DEFAULT_FILTER_LABELS,
    onValueChange: vi.fn<(value: unknown) => void>(),
    operator: { label: "is between", value: "between" },
    options: {
      error: false,
      hasMore: false,
      items: [],
      loading: false,
      loadMore: vi.fn<() => void>(),
      query: "",
      resolve: vi.fn<() => undefined>(),
      retry: vi.fn<() => void>(),
      setQuery: vi.fn<() => void>(),
    },
    value,
  };
}

describe(FilterDateRangeEditor, () => {
  it("applies its class name", () => {
    render(
      <FilterDateRangeEditor
        {...createProperties(["2026-03-01", "2026-03-31"])}
        className="filter-date-range-editor"
      />,
    );

    expect(screen.getByTestId("filter-date-range-editor").className).toBe(
      "filter-date-range-editor",
    );
  });

  it("writes each day it is given and clears one it is not", () => {
    const properties = createProperties();

    render(<FilterDateRangeEditor {...properties} />);

    fireEvent.change(screen.getByLabelText("Date to"), {
      target: { value: "2026-03-31" },
    });

    expect(properties.onValueChange).toHaveBeenLastCalledWith([
      null,
      "2026-03-31",
    ]);
  });

  it("commits on Enter or Apply and cancels on Escape", () => {
    const properties = createProperties(["2026-03-01", ""]);

    render(<FilterDateRangeEditor {...properties} />);

    fireEvent.keyDown(screen.getByLabelText("Date from"), { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    fireEvent.keyDown(screen.getByLabelText("Date to"), { key: "Escape" });
    fireEvent.keyDown(screen.getByLabelText("Date to"), { key: "a" });

    expect(properties.commit).toHaveBeenCalledTimes(2);
    expect(properties.cancel).toHaveBeenCalledTimes(1);
  });

  it("clears the day that is emptied and keeps the other", () => {
    const properties = createProperties(["2026-03-01", "2026-03-31"]);

    render(<FilterDateRangeEditor {...properties} />);
    fireEvent.change(screen.getByLabelText("Date from"), {
      target: { value: "" },
    });

    expect(properties.onValueChange).toHaveBeenLastCalledWith([
      null,
      "2026-03-31",
    ]);
  });
});
