import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarEmpty } from "./calendar-empty";

describe(CalendarEmpty, () => {
  it("applies its class name", () => {
    render(
      <CalendarEmpty
        className="calendar-empty"
        emptiness={{ kind: "match" }}
        onJump={() => {}}
      />,
    );

    expect(screen.getByTestId("calendar-empty").className).toBe(
      "calendar-empty",
    );
  });
});
