import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Filters } from "@codebase/presentation";

import { filterGroup, tagRule } from "../../testing/event-filters";
import { createEventFilterFields } from "../utilities/event-filter-fields.utilities";

import { FilterChipRow } from "./filter-chip-row";

import type {
  EventFilterQuery,
  EventFilterValue,
} from "../types/event-filters.types";
import type { ReactNode } from "react";

const FIELDS = createEventFilterFields([
  {
    id: "tag-type",
    name: "Type",
    values: [
      {
        count: 3,
        depth: 1,
        id: "tag-ingress",
        name: "Ingress",
        path: "Ingress",
      },
    ],
  },
]);

/**
 * Filters holding one rule, whose chip the row draws.
 */
function FiltersWrapper(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  return (
    <Filters<EventFilterValue>
      fields={[...FIELDS]}
      onQueryChange={vi.fn<(query: EventFilterQuery) => void>()}
      query={filterGroup("and", tagRule("type", "is_any_of", ["ingress"]))}
    >
      {properties.children}
    </Filters>
  );
}

function renderRow(query: EventFilterQuery): void {
  render(
    <Filters<EventFilterValue>
      fields={[...FIELDS]}
      onQueryChange={vi.fn<(query: EventFilterQuery) => void>()}
      query={query}
    >
      <FilterChipRow className="filter-chip-row" />
    </Filters>,
  );
}

describe(FilterChipRow, () => {
  it("applies its class name", () => {
    render(<FilterChipRow className="filter-chip-row" />, {
      wrapper: FiltersWrapper,
    });

    expect(screen.getByTestId("filter-chip-row").className).toBe(
      "filter-chip-row",
    );
  });

  it("draws nothing while the tree has no rules", () => {
    renderRow(filterGroup("and"));

    expect(screen.queryByTestId("filter-chip-row")).toBeNull();
  });
});
