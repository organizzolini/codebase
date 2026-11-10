import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { fieldRule, filterGroup } from "../../../testing/event-filters";
import { EMPTY_EVENT_FILTER } from "../../components/calendar-filters/event-filter-tree.constants";

import { useFilterQuery } from "./use-filter-query";

import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";

describe(useFilterQuery, () => {
  it("returns its result", () => {
    const { result } = renderHook(() =>
      useFilterQuery(
        undefined,
        [],
        vi.fn<(filter: EventFilterQuery) => void>(),
      ),
    );

    expect(result.current.query).toStrictEqual(EMPTY_EVENT_FILTER);
    expect(result.current).toStrictEqual({
      handlePresetSelect: expect.any(Function),
      handleQueryChange: expect.any(Function),
      query: EMPTY_EVENT_FILTER,
    });
  });

  it("opens on the filter the link holds", () => {
    const filter = filterGroup("and", fieldRule("hour", "between", [22, 23]));
    const { result } = renderHook(() =>
      useFilterQuery(filter, [], vi.fn<(filter: EventFilterQuery) => void>()),
    );

    expect(result.current.query).toStrictEqual(filter);
  });

  it("writes a preset picked to the link at once", () => {
    const onFilterChange = vi.fn<(filter: EventFilterQuery) => void>();
    const filter = filterGroup("and", fieldRule("hour", "between", [22, 23]));
    const { result } = renderHook(() =>
      useFilterQuery(undefined, [], onFilterChange),
    );

    act(() => {
      result.current.handlePresetSelect(filter);
    });

    expect(result.current.query).toStrictEqual(filter);
    expect(onFilterChange).toHaveBeenCalledExactlyOnceWith(expect.anything());
  });
});
