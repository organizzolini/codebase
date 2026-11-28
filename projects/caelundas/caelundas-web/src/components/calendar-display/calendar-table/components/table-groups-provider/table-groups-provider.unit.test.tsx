import { act, render, screen } from "@testing-library/react";
import { use } from "react";
import { describe, expect, it } from "vitest";

import { TableGroupsProvider } from "./table-groups-provider";
import { TableGroupsContext } from "./table-groups-provider.constants";

import type { TableGroupsValue } from "./table-groups-provider.types";

function renderShared(): { current: TableGroupsValue | undefined } {
  const shared: { current: TableGroupsValue | undefined } = {
    current: undefined,
  };

  function Reader(): null {
    shared.current = use(TableGroupsContext);

    return null;
  }

  render(
    <TableGroupsProvider>
      <Reader />
    </TableGroupsProvider>,
  );

  return shared;
}

describe(TableGroupsProvider, () => {
  it("applies its class name", () => {
    render(<TableGroupsProvider className="table-groups-provider" />);

    expect(screen.getByTestId("table-groups-provider").className).toBe(
      "table-groups-provider",
    );
  });

  it("offers nothing to do until the table names its groups", () => {
    const shared = renderShared();

    expect(shared.current).toMatchObject({ provided: true });
    expect(shared.current?.canCollapse([0])).toBe(false);
    expect(shared.current?.canExpand([0])).toBe(false);
    expect(shared.current?.state.limit).toBe(100);
    expect(shared.current?.state.pages).toBe(1);
  });

  it("opens only the first path at first, and opens every group, or none, on request", () => {
    const shared = renderShared();

    act(() => {
      shared.current?.dispatch({
        firstPath: ["a", "a|a1"],
        groupIds: ["a", "b", "a|a1"],
        groupLevels: [0, 0, 1],
        type: "reset",
      });
    });

    expect([...(shared.current?.state.expanded ?? [])]).toStrictEqual([
      "a",
      "a|a1",
    ]);
    expect(shared.current?.canCollapse([0, 1])).toBe(true);
    expect(shared.current?.canExpand([0, 1])).toBe(true);

    act(() => {
      shared.current?.expandAll([0, 1]);
    });

    expect(shared.current?.state.expanded.size).toBe(3);
    expect(shared.current?.canCollapse([0, 1])).toBe(true);
    expect(shared.current?.canExpand([0, 1])).toBe(false);

    act(() => {
      shared.current?.collapseAll([1]);
    });

    expect(
      [...(shared.current?.state.expanded ?? [])].toSorted(),
    ).toStrictEqual(["a", "b"]);
    expect(shared.current?.canExpand([1])).toBe(true);
    expect(shared.current?.canCollapse([1])).toBe(false);

    act(() => {
      shared.current?.collapseAll([0, 1]);
    });

    expect(shared.current?.state.expanded.size).toBe(0);
    expect(shared.current?.canCollapse([0, 1])).toBe(false);
    expect(shared.current?.canExpand([0, 1])).toBe(true);
  });

  it("opens and closes one group by its id", () => {
    const shared = renderShared();

    act(() => {
      shared.current?.dispatch({
        firstPath: [],
        groupIds: ["a", "b"],
        groupLevels: [0, 0],
        type: "reset",
      });
    });
    act(() => {
      shared.current?.dispatch({ id: "a", type: "toggle" });
    });

    expect(shared.current?.state.expanded.has("a")).toBe(true);

    act(() => {
      shared.current?.dispatch({ id: "a", type: "toggle" });
    });

    expect(shared.current?.state.expanded.has("a")).toBe(false);
  });

  it("shares the page size and the pages loaded", () => {
    const shared = renderShared();

    act(() => {
      shared.current?.dispatch({ pages: 3, type: "set-pages" });
    });

    expect(shared.current?.state.pages).toBe(3);

    act(() => {
      shared.current?.dispatch({ limit: 50, type: "set-limit" });
    });

    expect(shared.current?.state).toMatchObject({ limit: 50, pages: 1 });
  });
});
