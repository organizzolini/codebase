import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NoForms } from "./no-forms";

describe(NoForms, () => {
  it("applies its class name", () => {
    render(<NoForms className="no-forms" />);

    expect(screen.getByTestId("no-forms").className).toBe("no-forms");
  });

  it("says the lexeme has no forms on record", () => {
    render(<NoForms />);

    expect(screen.getByText("No forms on record.")).toBeDefined();
  });
});
