/* cspell:words rosarum */

import { render, screen } from "@testing-library/react";
import lodash from "lodash";
import { describe, expect, it } from "vitest";

import { NounForms } from "./noun-forms";

const rows = [
  { case: "nominative", number: "singular", word: "rosa" },
  { case: "nominative", number: "plural", word: "rosae" },
  { case: "genitive", number: "singular", word: "rosae" },
  { case: "genitive", number: "plural", word: "rosarum" },
];

describe(NounForms, () => {
  it("applies its class name", () => {
    render(
      <NounForms
        className="noun-forms"
        rows={rows}
      />,
    );

    expect(screen.getByTestId("noun-forms").className).toBe("noun-forms");
  });

  it("lists the declension by case and number, in grammar-book order", () => {
    render(<NounForms rows={lodash.reverse([...rows])} />);

    expect(screen.getByText("rosarum")).toBeDefined();
    expect(
      screen
        .getAllByRole("cell")
        .map((cell) => /(nominative|genitive)/u.exec(cell.textContent)?.[0]),
    ).toStrictEqual(["nominative", "nominative", "genitive", "genitive"]);
  });

  it("leaves out a case the noun has no form for", () => {
    render(<NounForms rows={rows} />);

    expect(screen.queryByText("vocative")).toBeNull();
  });
});
