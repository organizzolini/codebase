import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { EMPTY_EVENT_FILTER } from "../calendar-filters/components/event-filter-model/event-filter-tree.constants";

import { CalendarViewStrip } from "./calendar-view-strip";

import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";

const PRESET = {
  description: "Every ingress.",
  filter: {
    combinator: "and" as const,
    id: "planet-sign-events-0",
    rules: [
      {
        id: "planet-sign-events-0-0",
        operator: "is_any_of",
        path: ["tag:tag-type"],
        type: "rule" as const,
        value: ["tag-ingress"],
      },
    ],
    type: "group" as const,
  },
  id: "planet-sign-events",
  name: "Planet-sign events",
};

function renderStrip(query: EventFilterQuery): {
  onSelect: ReturnType<typeof vi.fn<(filter: EventFilterQuery) => void>>;
} {
  const onSelect = vi.fn<(filter: EventFilterQuery) => void>();

  render(
    <CalendarViewStrip
      onSelect={onSelect}
      presets={[PRESET]}
      query={query}
    />,
  );

  return { onSelect };
}

describe(CalendarViewStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarViewStrip
        className="calendar-view-strip"
        onSelect={() => {}}
        presets={[PRESET]}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(screen.getByTestId("calendar-view-strip").className).toBe(
      "calendar-view-strip",
    );
  });

  it("names the preset the filter tree matches", () => {
    renderStrip(PRESET.filter);

    expect(screen.getByRole("group", { name: "Saved view" }).textContent).toBe(
      "ViewPlanet-sign events",
    );
  });

  it("names all events when nothing is filtered", () => {
    renderStrip(EMPTY_EVENT_FILTER);

    expect(screen.getByRole("group", { name: "Saved view" }).textContent).toBe(
      "ViewAll events",
    );
  });

  it("names a filter that matches no preset Custom", () => {
    renderStrip({
      ...PRESET.filter,
      rules: [{ ...PRESET.filter.rules[0], value: ["tag-other"] }],
    } as EventFilterQuery);

    expect(screen.getByRole("group", { name: "Saved view" }).textContent).toBe(
      "ViewCustom",
    );
  });

  it("applies the preset picked from the searchable list", async () => {
    const { onSelect } = renderStrip(EMPTY_EVENT_FILTER);

    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(
      await screen.findByRole("treeitem", { name: /Planet-sign/u }),
    );

    expect(onSelect).toHaveBeenCalledWith(PRESET.filter);
  });

  it("clears the filter when All events is picked", async () => {
    const { onSelect } = renderStrip(PRESET.filter);

    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(
      await screen.findByRole("treeitem", { name: /All events/u }),
    );

    expect(onSelect).toHaveBeenCalledWith(EMPTY_EVENT_FILTER);
  });
});
