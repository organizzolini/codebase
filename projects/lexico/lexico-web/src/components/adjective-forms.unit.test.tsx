import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdjectiveForms } from "./adjective-forms";

const rows = [
  {
    case: "nominative",
    gender: "masculine",
    number: "singular",
    word: "bonus",
  },
  { case: "nominative", gender: "feminine", number: "singular", word: "bona" },
  { case: "nominative", gender: "neuter", number: "singular", word: "bonum" },
];

describe(AdjectiveForms, () => {
  it("applies its class name", () => {
    render(
      <AdjectiveForms
        className="adjective-forms"
        rows={rows}
      />,
    );

    expect(screen.getByTestId("adjective-forms").className).toBe(
      "adjective-forms",
    );
  });

  it("shows the first gender's table and switches by tab", () => {
    render(<AdjectiveForms rows={rows} />);

    expect(screen.getByText("bonus")).toBeDefined();
    expect(screen.queryByText("bona")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "feminine" }));

    expect(screen.getByText("bona")).toBeDefined();
  });

  it("only offers the genders the adjective has", () => {
    render(<AdjectiveForms rows={rows.slice(0, 1)} />);

    expect(screen.getAllByRole("tab")).toHaveLength(1);
  });
});
