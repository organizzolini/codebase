import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTagPicker } from "./use-tag-picker";

import type { UseTagPickerProperties } from "./use-tag-picker.types";
import type { FilterOption } from "@codebase/presentation";

const ITEMS: FilterOption[] = [
  { data: { depth: 0, name: "Aspect" }, label: "Aspect", value: "aspect" },
  { data: { depth: 1, name: "Trine" }, label: "Trine", value: "trine" },
];

function createProperties(value: unknown): UseTagPickerProperties {
  return {
    cancel: vi.fn<() => void>(),
    commit: vi.fn<() => void>(),
    field: { id: "tag:type", label: "Type" },
    onValueChange: vi.fn<(value: unknown) => void>(),
    options: {
      error: false,
      hasMore: false,
      items: ITEMS,
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

describe(useTagPicker, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useTagPicker(createProperties([])));

    expect(result.current.rows.map((row) => row.item.value)).toStrictEqual([
      "aspect",
    ]);
    expect(result.current).toStrictEqual({
      handleOpen: expect.any(Function),
      handleOptionKeyDown: expect.any(Function),
      handleSearchKeyDown: expect.any(Function),
      handleToggle: expect.any(Function),
      rows: expect.any(Array),
    });
  });

  it("opens a tag to list the tags beneath it", () => {
    const { result } = renderHook(() => useTagPicker(createProperties([])));

    act(() => {
      result.current.handleOpen("aspect", true);
    });

    expect(result.current.rows.map((row) => row.item.value)).toStrictEqual([
      "aspect",
      "trine",
    ]);
  });

  it("writes a tick at once, picking a tag whose every tag beneath is picked", () => {
    const properties = createProperties([]);
    const { result } = renderHook(() => useTagPicker(properties));

    act(() => {
      result.current.handleToggle("trine");
    });

    expect(properties.onValueChange).toHaveBeenCalledWith(["aspect"]);
    expect(properties.commit).toHaveBeenCalledWith(["aspect"], {
      close: false,
    });
  });
});
