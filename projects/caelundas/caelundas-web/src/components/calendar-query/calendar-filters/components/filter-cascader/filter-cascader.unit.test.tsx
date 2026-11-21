import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createEventFilterFields } from "../event-filter-model/event-filter-fields.utilities";
import { EMPTY_EVENT_FILTER } from "../event-filter-model/event-filter-tree.constants";

import { FilterCascader } from "./filter-cascader";

import type { EventFilterQuery } from "../event-filter-model/event-filters.types";

const FIELDS = createEventFilterFields([
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
    ],
  },
]);

describe(FilterCascader, () => {
  it("applies its class name", () => {
    render(
      <FilterCascader
        className="filter-cascader"
        fields={FIELDS}
        onQueryChange={() => {}}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(screen.getByTestId("filter-cascader").className).toBe(
      "filter-cascader",
    );
  });

  it("searches the attributes under its prompt", () => {
    render(
      <FilterCascader
        fields={FIELDS}
        onQueryChange={() => {}}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(screen.getByPlaceholderText("Search attributes")).toBeDefined();
    expect(screen.getByText("Type")).toBeDefined();
  });

  it("writes a filter holding the value ticked", async () => {
    const onQueryChange = vi.fn<(query: EventFilterQuery) => void>();

    render(
      <FilterCascader
        fields={FIELDS}
        onQueryChange={onQueryChange}
        query={EMPTY_EVENT_FILTER}
      />,
    );
    fireEvent.click(screen.getByText("Type"));
    fireEvent.click(await screen.findByText("Ingress"));

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        combinator: "and",
        rules: [
          expect.objectContaining({ path: ["tag:type"], value: ["ingress"] }),
        ],
      }),
    );
  });
});
