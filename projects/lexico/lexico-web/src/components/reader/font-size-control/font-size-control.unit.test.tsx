import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FontSizeControl } from "./font-size-control";
import {
  readFontSize,
  stepFontSize,
  writeFontSize,
} from "./font-size-control.utilities";

import type { FontSize } from "./font-size-control.types";

describe(FontSizeControl, () => {
  it("applies its class name", () => {
    render(
      <FontSizeControl
        className="font-size-control"
        onChange={vi.fn<(size: FontSize) => void>()}
        size="medium"
      />,
    );

    expect(screen.getByTestId("font-size-control").className).toBe(
      "font-size-control",
    );
  });

  it("asks for the next size up or down", async () => {
    const onChange = vi.fn<(size: FontSize) => void>();

    render(
      <FontSizeControl
        onChange={onChange}
        size="medium"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Larger text" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Smaller text" }));

    expect(onChange).toHaveBeenNthCalledWith(1, "large");
    expect(onChange).toHaveBeenNthCalledWith(2, "small");
  });

  it("stops at the ends of the range", () => {
    expect(stepFontSize("large", 1)).toBe("large");
    expect(stepFontSize("small", -1)).toBe("small");
  });

  it("reads back only known sizes from storage", () => {
    globalThis.localStorage.setItem("lexico-reader-font-size", "huge");

    expect(readFontSize()).toBeUndefined();

    writeFontSize("large");

    expect(readFontSize()).toBe("large");
  });

  it("falls back when storage throws", () => {
    const original = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    );

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("blocked");
      },
    });

    expect(readFontSize()).toBeUndefined();
    expect(() => {
      writeFontSize("large");
    }).not.toThrow();

    if (original !== undefined) {
      Object.defineProperty(globalThis, "localStorage", original);
    }
  });
});
