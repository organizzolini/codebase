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

  it("opens folded to the first level, each tag by its own name with its events", () => {
    render(<FilterTagEditor {...createProperties()} />);

    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.queryByText("Compound Aspect")).toBeNull();
    expect(screen.getByText("400 events")).toBeDefined();
  });

  it("opens and closes the tags beneath a tag with its handle", () => {
    render(<FilterTagEditor {...createProperties()} />);
    fireEvent.click(screen.getByRole("button", { name: "Expand Aspect" }));

    expect(screen.getByText("Compound Aspect")).toBeDefined();
    expect(screen.getByText("24 events")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Collapse Aspect" }));

    expect(screen.queryByText("Compound Aspect")).toBeNull();
  });

  it("does not tick a tag when its handle is pressed", () => {
    const properties = createProperties();

    render(<FilterTagEditor {...properties} />);
    fireEvent.click(screen.getByRole("button", { name: "Expand Aspect" }));

    expect(properties.onValueChange).not.toHaveBeenCalled();
  });

  it("gives only the tags that have tags beneath them a handle", () => {
    render(<FilterTagEditor {...createProperties()} />);

    expect(screen.getAllByRole("button", { name: /^Expand / })).toHaveLength(1);
  });

  it("opens already showing the tags the rule holds", () => {
    render(<FilterTagEditor {...createProperties(["compound"])} />);

    expect(screen.getByText("Compound Aspect")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Collapse Aspect" }),
    ).toBeDefined();
  });

  it("says how many picks lie inside a closed tag", () => {
    const { rerender } = render(
      <FilterTagEditor {...createProperties(["compound"])} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse Aspect" }));

    expect(screen.getByText("1")).toBeDefined();

    rerender(<FilterTagEditor {...createProperties([])} />);

    expect(screen.queryByText("1")).toBeNull();
  });

  it("lists every match while searching, folded or not", () => {
    render(
      <FilterTagEditor
        {...createProperties(undefined, "comp", ITEMS.slice(1, 2))}
      />,
    );

    expect(screen.getByText("Compound Aspect")).toBeDefined();
    expect(screen.queryByRole("button", { name: /^Expand / })).toBeNull();
  });

  it("ticks the tags the rule holds", () => {
    render(<FilterTagEditor {...createProperties(["compound"])} />);

    const [aspect, compound] = screen.getAllByRole("option");

    // The only tag beneath Aspect is picked, so Aspect is picked in full.
    expect(aspect?.getAttribute("aria-selected")).toBe("true");
    expect(compound?.getAttribute("aria-selected")).toBe("true");
  });

  it("shows a tag with only some of its tags ticked as partly ticked", () => {
    const items: FilterOption[] = [
      ...ITEMS.slice(0, 2),
      {
        data: { depth: 1, name: "Major Aspect" },
        label: "Major Aspect",
        value: "major",
      },
    ];

    render(<FilterTagEditor {...createProperties(["compound"], "", items)} />);

    const [aspect] = screen.getAllByRole("option");
    const box = aspect?.querySelector('[data-slot="checkbox"]');

    expect(aspect?.getAttribute("aria-selected")).toBe("false");
    expect(box?.getAttributeNames()).toContain("data-indeterminate");
    expect(box?.getAttributeNames()).not.toContain("data-checked");
  });

  it("ticks everything beneath a tag with it, and clears it all together", () => {
    const items: FilterOption[] = [
      ...ITEMS.slice(0, 2),
      {
        data: { depth: 1, name: "Major Aspect" },
        label: "Major Aspect",
        value: "major",
      },
    ];
    const properties = createProperties(["compound"], "", items);

    render(<FilterTagEditor {...properties} />);
    fireEvent.click(screen.getByText("Aspect"));

    expect(properties.onValueChange).toHaveBeenCalledWith(["aspect"]);
  });

  it("writes a tag it is ticked on at once, leaving the list open", () => {
    const properties = createProperties(["ingress"]);

    render(<FilterTagEditor {...properties} />);
    fireEvent.click(screen.getByRole("button", { name: "Expand Aspect" }));
    fireEvent.click(screen.getByText("Compound Aspect"));

    // Compound is Aspect's only tag, so ticking it picks Aspect in full.
    expect(properties.onValueChange).toHaveBeenCalledWith([
      "aspect",
      "ingress",
    ]);
    expect(properties.commit).toHaveBeenCalledWith(["aspect", "ingress"], {
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

    const [aspect, ingress] = screen.getAllByRole("option") as [
      HTMLElement,
      HTMLElement,
    ];

    aspect.focus();
    fireEvent.keyDown(aspect, { key: "ArrowDown" });

    expect(document.activeElement).toBe(ingress);

    fireEvent.keyDown(ingress, { key: " " });

    expect(properties.onValueChange).toHaveBeenCalledWith(["ingress"]);

    fireEvent.keyDown(ingress, { key: "ArrowUp" });

    expect(document.activeElement).toBe(aspect);
  });

  it("opens and closes a focused tag with the right and left arrows", () => {
    render(<FilterTagEditor {...createProperties()} />);

    const [aspect] = screen.getAllByRole("option") as [HTMLElement];

    fireEvent.keyDown(aspect, { key: "ArrowRight" });

    expect(screen.getByText("Compound Aspect")).toBeDefined();

    fireEvent.keyDown(aspect, { key: "ArrowLeft" });

    expect(screen.queryByText("Compound Aspect")).toBeNull();
  });

  it("leaves the arrows alone on a tag with nothing beneath it", () => {
    render(<FilterTagEditor {...createProperties()} />);

    const ingress = screen.getAllByRole("option").at(1) ?? document.body;

    fireEvent.keyDown(ingress, { key: "ArrowRight" });

    expect(screen.getAllByRole("option")).toHaveLength(2);
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
