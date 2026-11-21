import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReaderLine } from "./reader-line";

import type { ReaderLineNode } from "../reader-lines/reader-lines.types";

const LINE: ReaderLineNode = {
  id: "line-0",
  index: 0,
  label: "1.1",
  tokens: {
    edges: [
      { node: { data: "Arma", id: "t0", index: 0, isPunctuation: false } },
      { node: { data: ",", id: "t1", index: 1, isPunctuation: true } },
    ],
  },
};

describe(ReaderLine, () => {
  it("applies its class name", () => {
    render(
      <ReaderLine
        className="reader-line"
        line={LINE}
      />,
    );

    expect(screen.getByTestId("reader-line").className).toBe("reader-line");
  });

  it("anchors the line by its index", () => {
    render(<ReaderLine line={LINE} />);

    expect(screen.getByTestId("reader-line").id).toBe("line-0");
  });

  it("rules the line number off from the text with a thin vertical line", () => {
    render(<ReaderLine line={LINE} />);

    const gutter = screen.getByTestId("reader-line-gutter");

    expect(gutter.textContent).toBe("1.1");
    expect(gutter.className).toContain("border-r");
  });

  it("renders words as elements and punctuation as plain text", () => {
    render(<ReaderLine line={LINE} />);

    expect(screen.getAllByTestId("reader-token")).toHaveLength(1);
    expect(screen.getByText("1.1")).toBeDefined();
    expect(screen.getByTestId("reader-line").textContent).toBe("1.1Arma,");
  });
});
