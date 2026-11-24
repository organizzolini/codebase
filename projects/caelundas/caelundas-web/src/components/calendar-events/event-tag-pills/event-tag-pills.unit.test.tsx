import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TagIconsContext } from "../tag-pill-label/tag-pill-label.constants";

import { EventTagPills } from "./event-tag-pills";

describe(EventTagPills, () => {
  it("applies its class name", () => {
    render(<EventTagPills className="event-tag-pills" />);

    expect(screen.getByTestId("event-tag-pills").className).toBe(
      "event-tag-pills",
    );
  });

  it("draws a pill for each tag, titled with its path and tinted by its root", () => {
    render(
      <EventTagPills
        tags={[
          { depth: 1, id: "a", name: "Aspect", path: "Aspect / Simple" },
          { depth: 1, id: "b", name: "Leo", path: "Sign / Leo" },
        ]}
      />,
    );

    const aspect = screen.getByText("Aspect").closest("li");
    const leo = screen.getByText("Leo").closest("li");

    expect(aspect?.dataset["path"]).toBe("Aspect / Simple");
    expect(aspect?.style.background).not.toBe(leo?.style.background);
  });

  it("draws each tag's icon, from the facets, beside its name", () => {
    render(
      <TagIconsContext value={new Map([["a", "shapes"]])}>
        <EventTagPills
          tags={[{ depth: 1, id: "a", name: "Aspect", path: "Aspect" }]}
        />
      </TagIconsContext>,
    );

    expect(
      screen
        .getByText("Aspect")
        .closest("li")
        ?.querySelector("[data-testid='tag-icon']"),
    ).not.toBeNull();
  });
});
