import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Cascader } from "@codebase/presentation";

import { QueryCascaderPanel } from "./query-cascader-panel";

import type { ReactNode } from "react";

/**
 * Draws the panel inside an open Cascader of two items, which it reads its state from.
 */
function renderPanel(
  mode: "columns" | "drill" | "tree",
  panels?: Readonly<Record<string, ReactNode>>,
): void {
  render(
    <Cascader
      items={[
        { label: "One", value: "one" },
        { label: "Two", value: "two" },
        {
          children: [{ label: "Inner", value: "inner" }],
          label: "Three",
          value: "three",
        },
      ]}
      mode={mode}
      onValueChange={() => {}}
      value=""
      inline
      open
    >
      <QueryCascaderPanel
        mode={mode}
        panels={panels}
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

    expect(screen.getAllByRole("treeitem")).toHaveLength(3);
  });

  it("lists the items as options when drilling", () => {
    renderPanel("drill");

    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("lists the items as options in the columns", () => {
    renderPanel("columns");

    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("draws a branch's own content in place of its list", () => {
    renderPanel("drill", { three: <p>Pick a view</p> });
    fireEvent.click(screen.getByRole("option", { name: /^Three,/u }));

    expect(screen.getByText("Pick a view")).toBeDefined();
    expect(screen.queryByRole("option", { name: "Inner" })).toBeNull();
  });
});
