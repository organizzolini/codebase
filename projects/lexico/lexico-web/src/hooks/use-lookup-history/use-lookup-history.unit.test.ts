/* cspell:words Mutatas virum */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useLookupHistory } from "./use-lookup-history";
import {
  LOOKUP_HISTORY_CAP,
  LOOKUP_HISTORY_KEY,
} from "./use-lookup-history.constants";

const LOOKUP = {
  definition: null,
  form: "ablative singular",
  line: 0,
  slug: "vergil-aeneid-1",
  title: "Aeneid",
  token: 0,
  word: "Arma",
};

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
      recordSearch: expect.any(Function),
    });
  });

  it("records lookups newest first and clears them", () => {
    const { result } = renderHook(() => useLookupHistory());

    act(() => {
      result.current.record(LOOKUP);
    });

    expect(result.current.entries.map((entry) => entry)).toStrictEqual([
      expect.objectContaining({ kind: "lookup", word: "Arma" }),
    ]);

    act(() => {
      result.current.clear();
    });

    expect(result.current.entries).toStrictEqual([]);
  });

  it("records searches and moves a repeated search to the top", () => {
    const { result } = renderHook(() => useLookupHistory());

    act(() => {
      result.current.recordSearch("arma");
      result.current.recordSearch("virum");
      result.current.recordSearch("ARMA");
    });

    expect(result.current.entries).toStrictEqual([
      expect.objectContaining({ kind: "search", query: "ARMA" }),
      expect.objectContaining({ kind: "search", query: "virum" }),
    ]);
  });

  it("keeps lookups and searches within one shared cap", () => {
    const { result } = renderHook(() => useLookupHistory());

    act(() => {
      for (let index = 0; index < LOOKUP_HISTORY_CAP; index++) {
        result.current.recordSearch(`query ${index}`);
      }
      result.current.record(LOOKUP);
    });

    expect(result.current.entries).toHaveLength(LOOKUP_HISTORY_CAP);
    expect(result.current.entries[0]).toMatchObject({
      kind: "lookup",
      word: "Arma",
    });
  });

  it("reads entries stored before searches existed as lookups", () => {
    globalThis.localStorage.setItem(
      LOOKUP_HISTORY_KEY,
      JSON.stringify([
        {
          definition: null,
          form: "ablative singular",
          line: 0,
          recordedAt: 1,
          slug: "vergil-aeneid-1",
          token: 0,
          word: "Arma",
        },
      ]),
    );

    const { result } = renderHook(() => useLookupHistory());

    expect(result.current.entries).toStrictEqual([
      expect.objectContaining({ kind: "lookup", word: "Arma" }),
    ]);
  });
});
