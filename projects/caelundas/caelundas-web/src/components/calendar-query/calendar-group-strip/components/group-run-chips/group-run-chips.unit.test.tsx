import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GroupRunChips } from "./group-run-chips";

import type { GroupRun } from "../../calendar-group-strip.types";

const RUNS: GroupRun[] = [
  { field: "month", levels: [{ field: "month" }] },
  { field: "year", levels: [{ field: "year" }] },
];

describe(GroupRunChips, () => {
  it("draws the one Tags chip when the link names no grouping", () => {
    render(
      <GroupRunChips
        defaultLevels={[0, 1]}
        fields={[]}
        onGroupingChange={() => {}}
        runLevels={[]}
        runs={RUNS}
        view="table"
        isDefaultGrouping
      />,
    );

    expect(screen.getByText("Tags")).toBeDefined();
    expect(screen.queryByText("month")).toBeNull();
  });

  it("draws a chip per run", () => {
    render(
      <GroupRunChips
        defaultLevels={[]}
        fields={[]}
        isDefaultGrouping={false}
        onGroupingChange={() => {}}
        runLevels={[[0], [1]]}
        runs={RUNS}
        view="table"
      />,
    );

    expect(screen.getByText("month")).toBeDefined();
    expect(screen.getByText("year")).toBeDefined();
  });

  it("removes a run from its chip's menu", async () => {
    const onGroupingChange = vi.fn<(grouping: unknown[]) => void>();

    render(
      <GroupRunChips
        defaultLevels={[]}
        fields={[]}
        isDefaultGrouping={false}
        onGroupingChange={onGroupingChange}
        runLevels={[[0], [1]]}
        runs={RUNS}
        view="table"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "month options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onGroupingChange).toHaveBeenCalledExactlyOnceWith([
      { field: "year" },
    ]);
  });

  it("moves a run right from its chip's menu", async () => {
    const onGroupingChange = vi.fn<(grouping: unknown[]) => void>();

    render(
      <GroupRunChips
        defaultLevels={[]}
        fields={[]}
        isDefaultGrouping={false}
        onGroupingChange={onGroupingChange}
        runLevels={[[0], [1]]}
        runs={RUNS}
        view="table"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "month options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /right/iu }));

    expect(onGroupingChange).toHaveBeenCalledExactlyOnceWith([
      { field: "year" },
      { field: "month" },
    ]);
  });

  it("moves a run left from its chip's menu", async () => {
    const onGroupingChange = vi.fn<(grouping: unknown[]) => void>();

    render(
      <GroupRunChips
        defaultLevels={[]}
        fields={[]}
        isDefaultGrouping={false}
        onGroupingChange={onGroupingChange}
        runLevels={[[0], [1]]}
        runs={RUNS}
        view="table"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "year options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /left/iu }));

    expect(onGroupingChange).toHaveBeenCalledExactlyOnceWith([
      { field: "year" },
      { field: "month" },
    ]);
  });
});
