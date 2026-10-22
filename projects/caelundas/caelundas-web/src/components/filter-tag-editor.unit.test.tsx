import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import {
  FilterTagEditor,
  type FilterTagEditorProperties,
} from "./filter-tag-editor";

import type { FilterOption } from "@codebase/presentation";

const ITEMS: FilterOption[] = [
  {
    data: { depth: 0, name: "Aspect" },
    description: "400 events",
    label: "Aspect",
    value: "aspect",
  },
  {
    data: { depth: 1, name: "Compound Aspect" },
    description: "24 events",
    label: "Compound Aspect",
    value: "compound",
  },
  { description: "3 events", label: "Ingress", value: "ingress" },
];

/**
 * The properties the builder hands the editor, with spies for its callbacks.
 */
function createProperties(
  value?: unknown,
  query = "",
  items: FilterOption[] = ITEMS,
): Omit<FilterTagEditorProperties, "className"> {
  return {
    autoFocusProps: { autoFocus: false, ref: vi.fn<() => void>() },
    back: vi.fn<() => void>(),
    cancel: vi.fn<() => void>(),
    commit: vi.fn<() => void>(),
    field: { id: "tag:type", label: "Type" },
    host: "create",
    labels: DEFAULT_FILTER_LABELS,
    onValueChange: vi.fn<(value: unknown) => void>(),
    operator: { label: "is any of", value: "is_any_of" },
    options: {
      error: false,
      hasMore: false,
      items,
      loading: false,
      loadMore: vi.fn<() => void>(),
      query,
      resolve: vi.fn<() => undefined>(),
      retry: vi.fn<() => void>(),
      setQuery: vi.fn<() => void>(),
    },
    value,
  };
}

describe(FilterTagEditor, () => {
  it("applies its class name", () => {
    render(
      <FilterTagEditor
        {...createProperties()}
        className="filter-tag-editor"
      />,
    );

    expect(screen.getByTestId("filter-tag-editor").className).toBe(
      "filter-tag-editor",
    );
  });

  it("lists each tag by its own name with the events it matches", () => {
    render(<FilterTagEditor {...createProperties()} />);

    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByText("Compound Aspect")).toBeDefined();
    expect(screen.getByText("24 events")).toBeDefined();
  });

  it("ticks the tags the rule holds", () => {
    render(<FilterTagEditor {...createProperties(["compound"])} />);

    const [aspect, compound] = screen.getAllByRole("option");

    expect(aspect?.getAttribute("aria-selected")).toBe("false");
    expect(compound?.getAttribute("aria-selected")).toBe("true");
  });

  it("writes a tag it is ticked on at once, leaving the list open", () => {
    const properties = createProperties(["ingress"]);

    render(<FilterTagEditor {...properties} />);
    fireEvent.click(screen.getByText("Compound Aspect"));

    expect(properties.onValueChange).toHaveBeenCalledWith([
      "ingress",
      "compound",
    ]);
    expect(properties.commit).toHaveBeenCalledWith(["ingress", "compound"], {
      close: false,
    });
  });

  it("clears a tag that is ticked again", () => {
    const properties = createProperties(["ingress", "compound"]);

    render(<FilterTagEditor {...properties} />);
    fireEvent.click(screen.getByText("Compound Aspect"));

    expect(properties.onValueChange).toHaveBeenCalledWith(["ingress"]);
  });

  it("toggles a focused row with the keyboard and moves between rows", () => {
    const properties = createProperties();

    render(<FilterTagEditor {...properties} />);

    const [aspect, compound] = screen.getAllByRole("option") as [
      HTMLElement,
      HTMLElement,
    ];

    aspect.focus();
    fireEvent.keyDown(aspect, { key: "ArrowDown" });

    expect(document.activeElement).toBe(compound);

    fireEvent.keyDown(compound, { key: " " });

    expect(properties.onValueChange).toHaveBeenCalledWith(["compound"]);

    fireEvent.keyDown(compound, { key: "ArrowUp" });

    expect(document.activeElement).toBe(aspect);
  });

  it("searches through the options it is handed", () => {
    const properties = createProperties();

    render(<FilterTagEditor {...properties} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Search Type" }), {
      target: { value: "comp" },
    });

    expect(properties.options.setQuery).toHaveBeenCalledWith("comp");
  });

  it("goes down the list from the search box and cancels on Escape", () => {
    const properties = createProperties();

    render(<FilterTagEditor {...properties} />);

    const search = screen.getByRole("textbox", { name: "Search Type" });

    fireEvent.keyDown(search, { key: "ArrowDown" });

    expect(document.activeElement).toBe(screen.getAllByRole("option")[0]);

    fireEvent.keyDown(search, { key: "Escape" });

    expect(properties.cancel).toHaveBeenCalledTimes(1);
  });

  it("says when nothing matches", () => {
    const properties = createProperties(undefined, "zzz", []);

    render(<FilterTagEditor {...properties} />);

    expect(screen.getByText("No matches")).toBeDefined();
  });
});
