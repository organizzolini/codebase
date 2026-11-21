import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Cascader } from "@codebase/presentation";

import { QueryCascaderPanel } from "./query-cascader-panel";

/**
 * Draws the panel inside an open Cascader of two items, which it reads its state from.
 */
function renderPanel(isColumns: boolean): void {
  render(
    <Cascader
      items={[
        { label: "One", value: "one" },
        { label: "Two", value: "two" },
      ]}
      mode={isColumns ? "columns" : "tree"}
      onValueChange={() => {}}
      value=""
      inline
      open
    >
      <QueryCascaderPanel
        isColumns={isColumns}
        placeholder="Search things"
      />
    </Cascader>,
  );
}

describe(QueryCascaderPanel, () => {
  it("draws the search box under the prompt it is given", () => {
    renderPanel(false);

    expect(screen.getByPlaceholderText("Search things")).toBeDefined();
  });

  it("lists the items as a tree", () => {
    renderPanel(false);

    expect(screen.getAllByRole("treeitem")).toHaveLength(2);
  });

  it("lists the items as options in the columns", () => {
    renderPanel(true);

    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});
