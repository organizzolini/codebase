import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createEventGroupFields } from "../lib/event-groups/event-group-fields";

import { GroupFieldPicker } from "./group-field-picker";

import type { EventGroupField } from "../lib/event-groups/event-groups.types";

const FIELDS = createEventGroupFields([
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
    ],
  },
]);

function renderPicker(
  overrides: Partial<Parameters<typeof GroupFieldPicker>[0]> = {},
): { onSelect: ReturnType<typeof vi.fn<(field: EventGroupField) => void>> } {
  const onSelect = vi.fn<(field: EventGroupField) => void>();

  render(
    <GroupFieldPicker
      fields={FIELDS}
      label="Group 1 by"
      onSelect={onSelect}
      value="tag:type"
      {...overrides}
    />,
  );

  return { onSelect };
}

describe(GroupFieldPicker, () => {
  it("applies its class name", () => {
    render(
      <GroupFieldPicker
        className="group-field-picker"
        fields={FIELDS}
        label="Group 1 by"
        onSelect={() => {}}
        value="tag:type"
      />,
    );

    expect(screen.getByTestId("group-field-picker").className).toBe(
      "group-field-picker",
    );
  });

  it("names the field it holds", () => {
    renderPicker();

    expect(screen.getByRole("button", { name: "Group 1 by" }).textContent).toBe(
      "Type",
    );
  });

  it("lists every field with a sentence on what it is", async () => {
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Group 1 by" }));

    const month = await screen.findByRole("option", { name: /^Month/u });

    expect(month.textContent).toContain("The month an event starts in");
  });

  it("reports another field picked, and not the one it holds", async () => {
    const { onSelect } = renderPicker();

    fireEvent.click(screen.getByRole("button", { name: "Group 1 by" }));
    fireEvent.click(await screen.findByRole("option", { name: /^Type/u }));

    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Group 1 by" }));
    fireEvent.click(await screen.findByRole("option", { name: /^Month/u }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "month" }),
    );
  });
});
