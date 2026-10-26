// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import "./react-setup";

// 🧪 Tests

describe("the shared React setup", () => {
  it("gives jsdom a matchMedia that reports no match", () => {
    expect(globalThis.matchMedia("(width > 1px)").matches).toBe(false);
    expect(globalThis.matchMedia("(width > 1px)").matches).toBe(false);
  });

  it("renders into the document during a test", () => {
    render(<p>Salve</p>);

    expect(screen.getByText("Salve")).toBeDefined();
  });

  it("unmounts what the last test rendered", () => {
    expect(screen.queryByText("Salve")).toBeNull();
  });
});
