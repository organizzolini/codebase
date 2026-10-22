import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_EVENT_FILTER } from "../lib/event-filters/event-filter-tree";

import { CalendarCollectionPicker } from "./calendar-collection-picker";

const COLLECTION = {
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

describe(CalendarCollectionPicker, () => {
  it("applies its class name", () => {
    render(
      <CalendarCollectionPicker
        className="calendar-collection-picker"
        collections={[COLLECTION]}
        onSelect={vi.fn<(filter: unknown) => void>()}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(screen.getByTestId("calendar-collection-picker").className).toBe(
      "calendar-collection-picker",
    );
  });

  it("shows the collection whose filters the tree holds, with what it holds", () => {
    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={vi.fn<(filter: unknown) => void>()}
        query={COLLECTION.filter}
      />,
    );

    const picker = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Collection",
    });

    expect(picker.value).toBe("planet-sign-events");
    expect(screen.getByText("Every ingress.")).toBeDefined();
  });

  it("shows all events when nothing is filtered", () => {
    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={vi.fn<(filter: unknown) => void>()}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(
      screen.getByRole<HTMLSelectElement>("combobox", { name: "Collection" })
        .value,
    ).toBe("all-events");
    expect(screen.getByText(/every event in the data/u)).toBeDefined();
  });

  it("shows custom for filters no collection holds, and cannot be picked", () => {
    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={vi.fn<(filter: unknown) => void>()}
        query={{
          ...COLLECTION.filter,
          rules: COLLECTION.filter.rules.map((rule) => ({
            ...rule,
            value: ["tag-other"],
          })),
        }}
      />,
    );

    const picker = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Collection",
    });
    const custom = screen.getByRole<HTMLOptionElement>("option", {
      name: "Custom",
    });

    expect(picker.value).toBe("custom");
    expect(custom.disabled).toBe(true);
  });

  it("applies a collection picked", () => {
    const onSelect = vi.fn<(filter: unknown) => void>();

    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={onSelect}
        query={EMPTY_EVENT_FILTER}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Collection" }), {
      target: { value: "planet-sign-events" },
    });

    expect(onSelect).toHaveBeenCalledWith(COLLECTION.filter);
  });

  it("clears the filters when all events is picked", () => {
    const onSelect = vi.fn<(filter: unknown) => void>();

    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={onSelect}
        query={COLLECTION.filter}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Collection" }), {
      target: { value: "all-events" },
    });

    expect(onSelect).toHaveBeenCalledWith(EMPTY_EVENT_FILTER);
  });
});
