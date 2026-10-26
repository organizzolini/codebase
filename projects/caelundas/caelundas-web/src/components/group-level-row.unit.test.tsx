import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createEventGroupFields } from "../lib/event-groups/event-group-fields";

import { GroupLevelRow } from "./group-level-row";

import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";

const FIELDS = createEventGroupFields([
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
      { count: 1, depth: 1, id: "cycle", name: "Cycle", path: "Cycle" },
    ],
  },
]);

function renderRow(
  overrides: Partial<Parameters<typeof GroupLevelRow>[0]> = {},
): {
  onChange: ReturnType<typeof vi.fn<(level: EventGroupLevel | null) => void>>;
  onOpenChange: ReturnType<typeof vi.fn<(open: boolean) => void>>;
} {
  const onChange = vi.fn<(level: EventGroupLevel | null) => void>();
  const onOpenChange = vi.fn<(open: boolean) => void>();

  render(
    <GroupLevelRow
      fields={FIELDS}
      isOpen={false}
      level={{ depth: 1, field: "tag:type" }}
      name="Group 1"
      onChange={onChange}
      onOpenChange={onOpenChange}
      {...overrides}
    />,
  );

  return { onChange, onOpenChange };
}

describe(GroupLevelRow, () => {
  it("applies its class name", () => {
    render(
      <GroupLevelRow
        className="group-level-row"
        fields={FIELDS}
        isOpen={false}
        level={{ depth: 1, field: "tag:type" }}
        name="Group 1"
        onChange={() => {}}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByTestId("group-level-row").className).toBe(
      "group-level-row",
    );
  });

  it("says what the level goes by", () => {
    renderRow();

    expect(
      screen.getByRole("button", { name: "Group 1 tags" }).textContent,
    ).toBe("First level");
  });

  it("says a label of its own in place of that", () => {
    renderRow({ valueLabel: "By kind" });

    expect(
      screen.getByRole("button", { name: "Group 1 tags" }).textContent,
    ).toBe("By kind");
  });

  it("opens the tag tree from its tags button", () => {
    const { onOpenChange } = renderRow();

    fireEvent.click(screen.getByRole("button", { name: "Group 1 tags" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("removes the level, unless it cannot be removed", () => {
    const { onChange } = renderRow();

    fireEvent.click(screen.getByRole("button", { name: "Remove group 1" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("has no remove button when it is not removable", () => {
    renderRow({ removable: false });

    expect(screen.queryByRole("button", { name: "Remove group 1" })).toBeNull();
  });

  it("reports the tags picked from the tree when it is open", () => {
    const { onChange } = renderRow({ isOpen: true });

    fireEvent.click(screen.getByRole("option", { name: /Ingress/u }));

    expect(onChange).toHaveBeenCalledWith({
      field: "tag:type",
      tags: ["ingress"],
    });
  });
});
