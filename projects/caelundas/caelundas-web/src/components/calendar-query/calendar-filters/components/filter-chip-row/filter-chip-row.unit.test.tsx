import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Filters } from "@codebase/presentation";

import {
  fieldRule,
  filterGroup,
  tagRule,
} from "../../../../../../testing/event-filters";
import { createEventFilterFields } from "../event-filter-model/event-filter-fields.utilities";

import { FilterChipRow } from "./filter-chip-row";

import type {
  EventFilterQuery,
  EventFilterValue,
} from "../event-filter-model/event-filters.types";
import type { ReactNode } from "react";

const FIELDS = createEventFilterFields([
  {
    id: "tag-aspect",
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
      query={filterGroup("and", tagRule("zodiac", "is_any_of", ["ingress"]))}
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

  it("keeps only a rule from its chip's menu, removing the others", async () => {
    const onQueryChange = vi.fn<(query: EventFilterQuery) => void>();
    const keep = fieldRule("tag:tag-aspect", "is_any_of", ["tag-ingress"]);
    const drop = fieldRule("weekday", "is_any_of", [1], { id: "drop" });

    render(
      <Filters<EventFilterValue>
        fields={[...FIELDS]}
        onQueryChange={onQueryChange}
        query={filterGroup("and", keep, drop)}
      >
        <FilterChipRow />
      </Filters>,
    );
    const [first] = await screen.findAllByRole("button", {
      name: /filter options/u,
    });

    fireEvent.click(first ?? document.body);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Only" }));

    expect(onQueryChange.mock.lastCall?.[0].rules).toStrictEqual([keep]);
  });

  it("offers Only disabled when the rule is alone", async () => {
    render(
      <Filters<EventFilterValue>
        fields={[...FIELDS]}
        onQueryChange={vi.fn<(query: EventFilterQuery) => void>()}
        query={filterGroup(
          "and",
          fieldRule("tag:tag-aspect", "is_any_of", ["tag-ingress"]),
        )}
      >
        <FilterChipRow />
      </Filters>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /filter options/u }),
    );

    const only = await screen.findByRole("menuitem", { name: "Only" });

    expect(only.getAttribute("aria-disabled")).toBe("true");
  });

  describe("folded", () => {
    const DATE = fieldRule("date", "between", ["2026-03-01", "2026-03-31"], {
      id: "date",
    });
    const WEEKDAY = fieldRule("weekday", "is_any_of", [1], { id: "weekday" });

    function renderFolded(isFolded: boolean): void {
      render(
        <Filters<EventFilterValue>
          fields={[...FIELDS]}
          onQueryChange={vi.fn<(query: EventFilterQuery) => void>()}
          query={filterGroup("and", DATE, WEEKDAY)}
        >
          <FilterChipRow isFolded={isFolded} />
        </Filters>,
      );
    }

    it("draws every chip while unfolded", () => {
      renderFolded(false);

      expect(document.querySelectorAll("[data-slot=filter-chip]")).toHaveLength(
        2,
      );
    });

    it("draws only the date range, which stays, once folded", () => {
      renderFolded(true);

      const chips = document.querySelectorAll("[data-slot=filter-chip]");

      expect(chips).toHaveLength(1);
      expect(chips[0]?.textContent).toContain("Date");
    });
  });
});
