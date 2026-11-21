import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormsOfKind } from "./forms-of-kind";

describe(FormsOfKind, () => {
  it("applies its class name", () => {
    render(
      <FormsOfKind
        className="forms-of-kind"
        partOfSpeech="noun"
        rows={[]}
      />,
    );

    expect(screen.getByTestId("forms-of-kind").className).toBe("forms-of-kind");
  });

  it("notes a lexeme without forms", () => {
    render(
      <FormsOfKind
        partOfSpeech="verb"
        rows={[]}
      />,
    );

    expect(screen.getByTestId("no-forms")).toBeDefined();
  });

  it("draws a noun's forms in the noun table", () => {
    render(
      <FormsOfKind
        partOfSpeech="noun"
        rows={[
          {
            case: "nominative",
            id: "1",
            kind: "NominalForm",
            number: "singular",
            word: "rosa",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("noun-forms")).toBeDefined();
  });
});
