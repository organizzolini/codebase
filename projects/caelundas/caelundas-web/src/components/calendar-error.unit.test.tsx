import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarError } from "./calendar-error";

describe(CalendarError, () => {
  it("applies its class name", () => {
    render(
      <CalendarError
        className="calendar-error"
        error={new Error("The events database answered 404")}
        onRetry={() => {}}
      />,
    );

    expect(screen.getByTestId("calendar-error").className).toBe(
      "calendar-error",
    );
  });
});
