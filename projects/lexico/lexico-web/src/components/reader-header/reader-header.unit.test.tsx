import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthorEra, TextCollection } from "../../graphql/generated/operations";

import { ReaderHeader } from "./reader-header";

import type { ReaderText } from "../reader-lines/reader-lines.types";
import type { ReactNode } from "react";

// The router needs a mounted tree for Link; the route tests cover real links.
vi.mock("@tanstack/react-router", () => ({
  Link: (
    properties: Readonly<{
      children: ReactNode;
      className?: string;
      search?: { search: string };
      to: string;
    }>,
  ) => (
    <a
      className={properties.className}
      href={`${properties.to}?search=${encodeURIComponent(properties.search?.search ?? "")}`}
    >
      {properties.children}
    </a>
  ),
}));

/** A text with only the fields a test varies. */
function textWith(overrides: Partial<ReaderText> = {}): ReaderText {
  return {
    author: {
      endYear: -19,
      era: AuthorEra.Classical,
      name: "Vergil",
      slug: "vergil",
      startYear: -70,
    },
    collection: TextCollection.Perseus,
    edition: null,
    editors: null,
    endYear: null,
    findSpot: null,
    id: "text-1",
    inscriptionType: null,
    lineCount: 9896,
    lines: { edges: [], pageInfo: { endCursor: null, hasNextPage: false } },
    material: null,
    nextText: null,
    parentText: null,
    previousText: null,
    printYear: null,
    province: null,
    publisher: null,
    slug: "vergil-aeneid",
    startYear: null,
    title: "Aeneid",
    type: "text",
    wordCount: null,
    ...overrides,
  };
}

describe(ReaderHeader, () => {
  it("applies its class name", () => {
    render(
      <ReaderHeader
        className="reader-header"
        text={textWith()}
      />,
    );

    expect(screen.getByTestId("reader-header").className).toBe("reader-header");
  });

  it("centers the author and the characteristics", () => {
    render(<ReaderHeader text={textWith()} />);

    expect(
      screen.getByRole("link", { name: "Vergil" }).parentElement?.parentElement
        ?.className,
    ).toContain("text-center");
  });

  it("links the author to the library search for that author", () => {
    render(<ReaderHeader text={textWith()} />);

    expect(
      screen.getByRole("link", { name: "Vergil" }).getAttribute("href"),
    ).toBe("/library?search=Vergil");
  });

  it("links the parent only when there is one", () => {
    render(
      <ReaderHeader
        text={textWith({
          parentText: { slug: "vergil-aeneid", title: "Aeneid" },
        })}
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("lists the author's era and dates and the text's lines, not its source", () => {
    render(
      <ReaderHeader
        text={textWith({ edition: "Second", publisher: "Press" })}
      />,
    );

    const facts = screen.getByRole("list", { name: "About this text" });

    expect(facts.textContent).toBe("EraClassicalLived70 BCE–19 BCELines9896");
  });

  it("lists what an inscription adds: its date, province, and material", () => {
    render(
      <ReaderHeader
        text={textWith({
          collection: TextCollection.Edcs,
          endYear: 200,
          material: "marble",
          province: "Roma",
          startYear: 100,
        })}
      />,
    );

    expect(
      screen.getByRole("list", { name: "About this text" }).textContent,
    ).toContain("Dated100 CE–200 CE");
  });

  it("leaves out the characteristics list when the text has none", () => {
    render(
      <ReaderHeader
        text={textWith({
          author: {
            endYear: null,
            era: null,
            name: "Anon",
            slug: "anon",
            startYear: null,
          },
          collection: null,
          lineCount: null,
        })}
      />,
    );

    expect(screen.queryByRole("list")).toBeNull();
  });
});
