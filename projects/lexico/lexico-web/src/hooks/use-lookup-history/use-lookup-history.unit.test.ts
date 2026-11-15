import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useLookupHistory } from "./use-lookup-history";

describe(useLookupHistory, () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("returns its result", () => {
    const { result } = renderHook(() => useLookupHistory());

    expect(result.current).toStrictEqual({
      clear: expect.any(Function),
      entries: [],
      record: expect.any(Function),
    });
  });

  it("records lookups newest first and clears them", () => {
    const { result } = renderHook(() => useLookupHistory());

    act(() => {
      result.current.record({
        definition: null,
        form: "ablative singular",
        line: 0,
        slug: "vergil-aeneid-1",
        token: 0,
        word: "Arma",
      });
    });

    expect(result.current.entries.map((entry) => entry.word)).toStrictEqual([
      "Arma",
    ]);

    act(() => {
      result.current.clear();
    });

    expect(result.current.entries).toStrictEqual([]);
  });
});
