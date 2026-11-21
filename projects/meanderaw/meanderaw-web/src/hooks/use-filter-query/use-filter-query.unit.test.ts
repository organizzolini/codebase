import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";
import { createFilterFields } from "../../components/gallery/gallery-filters/components/filter-model/filter-model.utilities";
import { DEFAULT_FILTER_LINK } from "../../components/gallery/gallery-filters/components/filter-query/filter-query.constants";
import { toFilterQuery } from "../../components/gallery/gallery-filters/components/filter-query/filter-query.utilities";

import { useFilterQuery } from "./use-filter-query";

import type { FilterGroup } from "../../components/gallery/gallery-filters/components/filter-model/filter-model.types";
import type { FilterLink } from "../../components/gallery/gallery-filters/components/filter-query/filter-query.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);
const FILTER: FilterGroup = {
  combinator: "and",
  rules: [{ field: "junctionCount", operator: "gte", value: 3 }],
};
const LINK: FilterLink = {
  filter: FILTER,
  repeats: 12,
  rows: { operator: "eq", value: 4 },
};

describe(useFilterQuery, () => {
  it("returns its result", () => {
    const { result } = renderHook(() =>
      useFilterQuery(LINK, FIELDS, vi.fn<(link: FilterLink) => void>()),
    );

    expect(result.current.query).toStrictEqual(toFilterQuery(LINK, FIELDS));
    expect(result.current).toStrictEqual({
      handleQueryChange: result.current.handleQueryChange,
      query: toFilterQuery(LINK, FIELDS),
    });
  });

  it("writes the link once an edit changes what it holds, not for an unfinished rule", () => {
    const onLinkChange = vi.fn<(link: FilterLink) => void>();
    const { result } = renderHook(() =>
      useFilterQuery(DEFAULT_FILTER_LINK, FIELDS, onLinkChange),
    );
    const base = result.current.query;

    act(() => {
      result.current.handleQueryChange({
        ...base,
        rules: [
          ...base.rules,
          {
            id: "new",
            operator: "",
            path: ["path", "junctionCount"],
            type: "rule",
            value: undefined,
          },
        ],
      });
    });

    expect(onLinkChange).not.toHaveBeenCalled();
    expect(result.current.query.rules).toHaveLength(3);

    act(() => {
      result.current.handleQueryChange({
        ...base,
        rules: [
          ...base.rules,
          {
            id: "new",
            operator: "gte",
            path: ["path", "junctionCount"],
            type: "rule",
            value: 3,
          },
        ],
      });
    });

    expect(onLinkChange).toHaveBeenCalledExactlyOnceWith({
      filter: FILTER,
      repeats: 12,
      rows: { operator: "eq", value: 4 },
    });
  });

  it("brings back rows and repeats when an edit leaves neither", () => {
    const { result } = renderHook(() =>
      useFilterQuery(LINK, FIELDS, vi.fn<(link: FilterLink) => void>()),
    );

    act(() => {
      result.current.handleQueryChange({
        ...result.current.query,
        rules: result.current.query.rules.slice(2),
      });
    });

    expect(result.current.query.rules.map((node) => node.id)).toStrictEqual([
      "rows",
      "repeats",
      "filter-0",
    ]);
  });

  it("takes a link the tree does not already hold, and keeps an edit the link catches up with", () => {
    const { rerender, result } = renderHook(
      ({ link }) =>
        useFilterQuery(link, FIELDS, vi.fn<(link: FilterLink) => void>()),
      { initialProps: { link: DEFAULT_FILTER_LINK } },
    );

    rerender({ link: LINK });

    expect(result.current.query).toStrictEqual(toFilterQuery(LINK, FIELDS));

    // An unfinished rule, which the link never carries, survives a rerender
    // with an unchanged link.
    act(() => {
      result.current.handleQueryChange({
        ...result.current.query,
        rules: [
          ...result.current.query.rules,
          {
            id: "new",
            operator: "",
            path: ["path", "junctionCount"],
            type: "rule",
            value: undefined,
          },
        ],
      });
    });
    rerender({ link: { ...LINK } });

    expect(result.current.query.rules.map((node) => node.id)).toContain("new");
  });
});
