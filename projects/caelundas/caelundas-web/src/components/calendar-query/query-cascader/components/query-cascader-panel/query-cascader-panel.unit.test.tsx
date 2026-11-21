import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Cascader } from "@codebase/presentation";

import { QueryCascaderPanel } from "./query-cascader-panel";

/**
 * Draws the panel inside an open Cascader of two items, which it reads its state from.
 */
function renderPanel(mode: "columns" | "drill" | "tree"): void {
  render(
    <Cascader
      items={[
        { label: "One", value: "one" },
        { label: "Two", value: "two" },
      ]}
      mode={mode}
      onValueChange={() => {}}
      value=""
      inline
      open
    >
      <QueryCascaderPanel
        mode={mode}
        placeholder="Search things"
      />
    </Cascader>,
  );
}

describe(QueryCascaderPanel, () => {
  it("draws the search box under the prompt it is given", () => {
    renderPanel("tree");

    expect(screen.getByPlaceholderText("Search things")).toBeDefined();
  });

  it("lists the items as a tree", () => {
    renderPanel("tree");

    expect(screen.getAllByRole("treeitem")).toHaveLength(2);
  });

  it("lists the items as options when drilling", () => {
    renderPanel("drill");

    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("lists the items as options in the columns", () => {
    renderPanel("columns");

    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});
