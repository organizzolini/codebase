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

  it("shows the collection whose filters the tree holds", () => {
    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={vi.fn<(filter: unknown) => void>()}
        query={COLLECTION.filter}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Collection" }).textContent,
    ).toContain("Planet-sign events");
  });

  it("shows all events when nothing is filtered, with no label or note", () => {
    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={vi.fn<(filter: unknown) => void>()}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Collection" }).textContent,
    ).toContain("All events");
    expect(screen.queryByText(/every event in the data/u)).toBeNull();
    expect(screen.queryByText("Collection")).toBeNull();
  });

  it("shows custom for filters no collection holds, and cannot be picked", async () => {
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

    const picker = screen.getByRole("combobox", { name: "Collection" });

    expect(picker.textContent).toContain("Custom");

    fireEvent.click(picker);

    const custom = await screen.findByRole("option", { name: "Custom" });

    expect(custom.getAttribute("aria-disabled")).toBe("true");
  });

  it("applies a collection picked", async () => {
    const onSelect = vi.fn<(filter: unknown) => void>();

    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={onSelect}
        query={EMPTY_EVENT_FILTER}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Collection" }));
    fireEvent.keyDown(
      await screen.findByRole("option", { name: "Planet-sign events" }),
      {
        key: "Enter",
      },
    );

    expect(onSelect).toHaveBeenCalledWith(COLLECTION.filter);
  });

  it("clears the filters when all events is picked", async () => {
    const onSelect = vi.fn<(filter: unknown) => void>();

    render(
      <CalendarCollectionPicker
        collections={[COLLECTION]}
        onSelect={onSelect}
        query={COLLECTION.filter}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Collection" }));
    fireEvent.keyDown(
      await screen.findByRole("option", { name: "All events" }),
      {
        key: "Enter",
      },
    );

    expect(onSelect).toHaveBeenCalledWith(EMPTY_EVENT_FILTER);
  });
});
