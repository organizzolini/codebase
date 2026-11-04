/* cspell:words rosarum */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormsTable } from "./forms-table";

const columns = [
  { key: "singular", label: "singular" },
  { key: "plural", label: "plural" },
];
const rows = [
  { key: "nominative", label: "nominative" },
  { key: "genitive", label: "genitive" },
];
const words: Record<string, string[]> = {
  "genitive|plural": ["rosarum"],
  "nominative|plural": ["rosae"],
  "nominative|singular": ["rosa", "rosae"],
};

describe(FormsTable, () => {
  it("applies its class name", () => {
    render(
      <FormsTable
        className="forms-table"
        columns={columns}
        lookup={() => []}
        rows={rows}
      />,
    );

    expect(screen.getByTestId("forms-table").className).toBe("forms-table");
  });

  it("lays each looked-up word in the cell for its row and column", () => {
    render(
      <FormsTable
        columns={columns}
        lookup={(row, column) => words[`${row}|${column}`] ?? []}
        rows={rows}
      />,
    );

    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent);

    expect(cells[0]).toContain("rosa");
    expect(cells[0]).toContain("rosae");
    expect(cells[1]).toContain("rosae");
    expect(cells[3]).toContain("rosarum");
  });

  it("names the rows and columns in the corners of the cells, and in full to screen readers", () => {
    render(
      <FormsTable
        columns={columns}
        lookup={() => []}
        rows={rows}
      />,
    );

    expect(screen.getAllByText("NOM")).toHaveLength(1);
    expect(screen.getAllByText("SG")).toHaveLength(1);
    expect(screen.getAllByText("PL")).toHaveLength(1);

    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent);

    expect(cells[0]).toContain("nominative singular:");
    expect(cells[1]).toContain("nominative plural:");
    expect(cells[2]).toContain("genitive singular:");
    expect(cells[3]).toContain("genitive plural:");
  });

  it("marks a form that has no word", () => {
    render(
      <FormsTable
        columns={columns}
        lookup={() => []}
        rows={rows}
      />,
    );

    expect(screen.getAllByText("–")).toHaveLength(4);
  });
});
