import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EVENT_COLOR_RULES } from "../lib/calendar/calendar-colors";
import { createEventGroupFields } from "../lib/event-groups/event-group-fields";

import { CalendarColorBy } from "./calendar-color-by";

import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
    ],
  },
  {
    id: "planet",
    name: "Planet",
    values: [
      { count: 2, depth: 1, id: "mars", name: "Mars", path: "Mars" },
      { count: 1, depth: 1, id: "venus", name: "Venus", path: "Venus" },
    ],
  },
];

function renderColorBy(colorBy?: EventGroupLevel): {
  onColorByChange: ReturnType<
    typeof vi.fn<(level: EventGroupLevel | undefined) => void>
  >;
} {
  const onColorByChange = vi.fn<(level: EventGroupLevel | undefined) => void>();

  render(
    <CalendarColorBy
      colorBy={colorBy}
      facets={FACETS}
      onColorByChange={onColorByChange}
    />,
  );

  return { onColorByChange };
}

describe(CalendarColorBy, () => {
  it("applies its class name", () => {
    render(
      <CalendarColorBy
        className="calendar-color-by"
        colorBy={undefined}
        facets={FACETS}
        onColorByChange={() => {}}
      />,
    );

    expect(screen.getByTestId("calendar-color-by").className).toBe(
      "calendar-color-by",
    );
  });

  it("colors by type, kind by kind, unless told otherwise, and names each kind", () => {
    renderColorBy();

    expect(screen.getByRole("button", { name: "Color by" }).textContent).toBe(
      "Type",
    );
    expect(screen.getByRole("button", { name: "Color tags" }).textContent).toBe(
      "By kind",
    );

    for (const rule of EVENT_COLOR_RULES) {
      expect(screen.getByText(rule.label)).toBeDefined();
    }
  });

  it("names each tag a field colors, and the field", () => {
    const fields = createEventGroupFields(FACETS);
    const planet = fields.find((field) => field.label === "Planet");

    renderColorBy({ depth: 1, field: planet?.id ?? "" });

    expect(screen.getByRole("button", { name: "Color by" }).textContent).toBe(
      "Planet",
    );
    expect(screen.getByText("Mars")).toBeDefined();
    expect(screen.getByText("Venus")).toBeDefined();
  });

  it("says each value gets a color when there is no legend to list", () => {
    renderColorBy({ field: "month" });

    expect(
      screen.getByText("Each value gets a color of its own."),
    ).toBeDefined();
  });

  it("colors by another field when one is picked", async () => {
    const { onColorByChange } = renderColorBy();

    fireEvent.click(screen.getByRole("button", { name: "Color by" }));
    fireEvent.click(await screen.findByRole("option", { name: /^Planet/u }));

    expect(onColorByChange).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 1 }),
    );
  });

  it("goes back to the default for picking the type, with every tag", async () => {
    const fields = createEventGroupFields(FACETS);
    const planet = fields.find((field) => field.label === "Planet");
    const { onColorByChange } = renderColorBy({
      depth: 1,
      field: planet?.id ?? "",
    });

    fireEvent.click(screen.getByRole("button", { name: "Color by" }));
    fireEvent.click(await screen.findByRole("option", { name: /^Type/u }));

    expect(onColorByChange).toHaveBeenCalledWith(undefined);
  });
});
