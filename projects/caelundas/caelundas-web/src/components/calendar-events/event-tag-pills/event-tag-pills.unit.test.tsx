import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
          { depth: 1, id: "a", name: "Aspect", path: "Type / Aspect" },
          { depth: 1, id: "b", name: "Leo", path: "Sign / Leo" },
        ]}
      />,
    );

    const aspect = screen.getByText("Aspect");
    const leo = screen.getByText("Leo");

    expect(aspect.dataset["path"]).toBe("Type / Aspect");
    expect(aspect.style.background).not.toBe(leo.style.background);
  });
});
