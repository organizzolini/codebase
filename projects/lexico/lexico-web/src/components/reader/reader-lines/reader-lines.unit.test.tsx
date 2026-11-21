import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReaderLines } from "./reader-lines";
import { mergeLines } from "./reader-lines.utilities";

import type { LineConnection } from "./reader-lines.types";

/** A page holding one line with no tokens. */
function page(id: string, hasNextPage: boolean): LineConnection {
  return {
    edges: [{ node: { id, index: 0, label: id, tokens: { edges: [] } } }],
    pageInfo: { endCursor: id, hasNextPage },
  };
}

describe(ReaderLines, () => {
  it("applies its class name", () => {
    render(
      <ReaderLines
        className="reader-lines"
        initial={page("a", false)}
        slug="text"
      />,
    );

    expect(screen.getByTestId("reader-lines").className).toBe("reader-lines");
  });

  it("offers more lines only while the API has them", () => {
    render(
      <ReaderLines
        initial={page("a", true)}
        slug="text"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Load more lines" }),
    ).toBeDefined();
  });

  it("appends a later page and takes its page info", () => {
    const merged = mergeLines(page("a", true), page("b", false));

    expect(merged.edges.map((edge) => edge.node.id)).toStrictEqual(["a", "b"]);
    expect(merged.pageInfo).toStrictEqual({
      endCursor: "b",
      hasNextPage: false,
    });
  });
});
