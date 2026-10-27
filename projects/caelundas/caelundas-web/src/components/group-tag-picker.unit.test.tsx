import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createEventGroupFields } from "../lib/event-groups/event-group-fields";

import { GroupTagPicker } from "./group-tag-picker";

const [FIRST] = createEventGroupFields([
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major Aspect",
        path: "Aspect / Major Aspect",
      },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
    ],
  },
]);

if (FIRST === undefined) {
  throw new Error("The seeded tags make no field");
}

const FIELD = FIRST;

describe(GroupTagPicker, () => {
  it("applies its class name", () => {
    render(
      <GroupTagPicker
        className="group-tag-picker"
        field={FIELD}
        onChange={() => {}}
        tags={[]}
      />,
    );

    expect(screen.getByTestId("group-tag-picker").className).toBe(
      "group-tag-picker",
    );
  });

  it("lists the root's tags with those picked ticked", () => {
    render(
      <GroupTagPicker
        field={FIELD}
        onChange={() => {}}
        tags={["ingress"]}
      />,
    );

    expect(
      screen
        .getByRole("option", { name: /Ingress/u })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("option", { name: /Aspect/u })
        .getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("reports the tags picked, more than one at a time", () => {
    const onChange = vi.fn<(tags: string[]) => void>();

    render(
      <GroupTagPicker
        field={FIELD}
        onChange={onChange}
        tags={["ingress"]}
      />,
    );
    fireEvent.click(screen.getByRole("option", { name: /Aspect/u }));

    expect(onChange).toHaveBeenCalledWith(["ingress", "aspect"]);
  });

  it("narrows the tree to a search", () => {
    render(
      <GroupTagPicker
        field={FIELD}
        onChange={() => {}}
        tags={[]}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Search Type" }), {
      target: { value: "ingress" },
    });

    expect(screen.queryByRole("option", { name: /Aspect/u })).toBeNull();
    expect(screen.getByRole("option", { name: /Ingress/u })).toBeDefined();
  });

  it("clears a tag that is ticked again, each tag on its own", () => {
    const onChange = vi.fn<(tags: string[]) => void>();

    render(
      <GroupTagPicker
        field={FIELD}
        onChange={onChange}
        tags={["ingress", "aspect"]}
      />,
    );
    fireEvent.click(screen.getByRole("option", { name: /Ingress/u }));

    // A group is made of each tag ticked, so ticking Aspect's tags is not
    // ticking Aspect, and none of them is partly ticked.
    expect(onChange).toHaveBeenCalledWith(["aspect"]);
  });
});
