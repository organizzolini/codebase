import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QueryCascader } from "./query-cascader";

import type { CascaderNode } from "@codebase/presentation";

const ITEMS: CascaderNode[] = [
  {
    children: [
      { label: "Ascending", value: "name:asc" },
      { label: "Descending", value: "name:desc" },
    ],
    label: "Name",
    value: "name",
  },
  { label: "Default order", value: "default" },
];

describe(QueryCascader, () => {
  it("applies its class name", () => {
    render(
      <QueryCascader
        className="query-cascader"
        items={ITEMS}
        onValueChange={() => {}}
        placeholder="Sort by"
        value={[]}
      />,
    );

    expect(screen.getByTestId("query-cascader").className).toBe(
      "query-cascader",
    );
  });

  it("lists the choices under a search box with the prompt", () => {
    render(
      <QueryCascader
        items={ITEMS}
        onValueChange={() => {}}
        placeholder="Sort by"
        value={[]}
      />,
    );

    expect(screen.getByPlaceholderText("Sort by")).toBeDefined();
    expect(screen.getAllByRole("treeitem")).toHaveLength(2);
  });

  it("reports the one picked, in a list of one", () => {
    const onValueChange = vi.fn<(value: string[]) => void>();

    render(
      <QueryCascader
        items={ITEMS}
        onValueChange={onValueChange}
        placeholder="Sort by"
        value={[]}
      />,
    );
    fireEvent.click(screen.getByRole("treeitem", { name: /Default order/u }));

    expect(onValueChange).toHaveBeenCalledWith(["default"]);
  });

  it("ticks everything beneath a branch when several can be picked", () => {
    const onValueChange = vi.fn<(value: string[]) => void>();

    render(
      <QueryCascader
        items={ITEMS}
        onValueChange={onValueChange}
        placeholder="Group by"
        value={[]}
        multiple
      />,
    );
    fireEvent.click(screen.getByText("Name"));

    expect(onValueChange).toHaveBeenCalledWith(
      expect.arrayContaining(["name", "name:asc", "name:desc"]),
    );
  });

  it("scrolls a branch to the top of the list when it opens", async () => {
    const scrollBy = vi.fn<(options: ScrollToOptions) => void>();

    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    render(
      <QueryCascader
        items={ITEMS}
        onValueChange={() => {}}
        placeholder="Sort by"
        value={[]}
      />,
    );
    const row = screen.getByRole("treeitem", { name: /Name/u });
    const viewport =
      row.closest('[data-slot="scroll-area-viewport"]') ?? document.body;

    Object.defineProperty(viewport, "scrollHeight", { value: 500 });
    Object.defineProperty(viewport, "scrollBy", { value: scrollBy });

    vi.spyOn(row, "getBoundingClientRect").mockReturnValue({
      top: 100,
    } as DOMRect);
    fireEvent.click(row);

    await waitFor(() => {
      expect(scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" }),
      );
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("gives a branch that cannot be ticked no checkbox slot, so only its leaves lead with a box", () => {
    const { container } = render(
      <QueryCascader
        defaultExpanded={["name"]}
        items={ITEMS}
        mode="tree"
        onValueChange={() => {}}
        placeholder="Filter by"
        selectable={(node) => node.value !== "name"}
        value={[]}
        multiple
      />,
    );

    expect(
      container.querySelectorAll('[data-slot="cascader-item-checkbox-spacer"]'),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll('[data-slot="cascader-item-checkbox"]'),
    ).not.toHaveLength(0);
  });
});
