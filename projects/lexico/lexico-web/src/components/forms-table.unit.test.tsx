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

  it("lays each looked-up word under its row and column", () => {
    render(
      <FormsTable
        columns={columns}
        lookup={(row, column) => words[`${row}|${column}`] ?? []}
        rows={rows}
      />,
    );

    expect(screen.getByText("rosa, rosae")).toBeDefined();
    expect(screen.getByText("rosarum")).toBeDefined();
    expect(screen.getByText("singular")).toBeDefined();
    expect(screen.getByText("genitive")).toBeDefined();
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
