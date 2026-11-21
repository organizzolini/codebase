import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ReaderHint } from "./reader-hint";
import { READER_HINT_KEY } from "./reader-hint.constants";
import { isHintSeen } from "./reader-hint.utilities";

describe(ReaderHint, () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("applies its class name", () => {
    render(<ReaderHint className="reader-hint" />);

    expect(screen.getByTestId("reader-hint").className).toBe("reader-hint");
  });

  it("stays hidden once it was dismissed in this browser", () => {
    globalThis.localStorage.setItem(READER_HINT_KEY, "true");

    render(<ReaderHint />);

    expect(screen.queryByTestId("reader-hint")).toBeNull();
  });

  it("is dismissed for good by its button", () => {
    render(<ReaderHint />);
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));

    expect(screen.queryByTestId("reader-hint")).toBeNull();
    expect(globalThis.localStorage.getItem(READER_HINT_KEY)).toBe("true");
  });

  it("is never seen when storage throws", () => {
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
    render(<ReaderHint />);
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));

    expect(isHintSeen()).toBe(false);

    if (original !== undefined) {
      Object.defineProperty(globalThis, "localStorage", original);
    }
  });
});
