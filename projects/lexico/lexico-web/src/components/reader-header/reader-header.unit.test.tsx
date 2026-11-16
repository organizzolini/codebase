import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReaderHeader } from "./reader-header";

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

describe(ReaderHeader, () => {
  it("applies its class name", () => {
    render(
      <ReaderHeader
        author="Vergil"
        className="reader-header"
        parent={null}
      />,
    );

    expect(screen.getByTestId("reader-header").className).toBe("reader-header");
  });

  it("links the author to the library search for that author", () => {
    render(
      <ReaderHeader
        author="Vergil"
        parent={null}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Vergil" }).getAttribute("href"),
    ).toBe("/library?search=Vergil");
  });

  it("links the parent only when there is one", () => {
    render(
      <ReaderHeader
        author="Vergil"
        parent={{ slug: "vergil-aeneid", title: "Aeneid" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Aeneid" })).toBeDefined();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
