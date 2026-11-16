import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("writes storage once per record, with no side effect in a state update", () => {
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useLookupHistory(), {
      wrapper: StrictMode,
    });
    write.mockClear();

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

    expect(write).toHaveBeenCalledTimes(1);

    write.mockRestore();
  });

  it("keeps two records made in one update", () => {
    const { result } = renderHook(() => useLookupHistory());

    act(() => {
      for (const [token, word] of ["Arma", "virumque"].entries()) {
        result.current.record({
          definition: null,
          form: "",
          line: 0,
          slug: "vergil-aeneid-1",
          token,
          word,
        });
      }
    });

    expect(result.current.entries.map((entry) => entry.word)).toStrictEqual([
      "virumque",
      "Arma",
    ]);
  });

  it("drops only the stored entries that are invalid", () => {
    const valid = {
      definition: null,
      form: "",
      line: 0,
      recordedAt: 1,
      slug: "vergil-aeneid-1",
      token: 0,
      word: "Arma",
    };
    globalThis.localStorage.setItem(
      "lexico-lookup-history",
      JSON.stringify([valid, { word: 7 }, null]),
    );

    const { result } = renderHook(() => useLookupHistory());

    expect(result.current.entries).toStrictEqual([valid]);
  });
});
