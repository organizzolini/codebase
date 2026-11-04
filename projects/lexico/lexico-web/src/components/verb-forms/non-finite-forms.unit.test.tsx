import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NonFiniteForms } from "./non-finite-forms";

describe(NonFiniteForms, () => {
  it("applies its class name", () => {
    render(
      <NonFiniteForms
        className="non-finite-forms"
        rows={[]}
      />,
    );

    expect(screen.getByTestId("non-finite-forms").className).toBe(
      "non-finite-forms",
    );
  });

  it("names each form without a person by its kind", () => {
    render(
      <NonFiniteForms
        rows={[
          {
            kind: "InfinitiveForm",
            tense: "present",
            voice: "active",
            word: "amare",
          },
        ]}
      />,
    );

    expect(screen.getByText("amare")).toBeDefined();
  });
});
