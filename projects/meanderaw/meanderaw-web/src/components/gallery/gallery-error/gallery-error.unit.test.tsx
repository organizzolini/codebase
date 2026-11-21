import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryError } from "./gallery-error";

describe(GalleryError, () => {
  it("applies its class name", () => {
    render(
      <GalleryError
        className="gallery-error"
        error={new Error("boom")}
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByTestId("gallery-error").className).toBe("gallery-error");
  });

  it("shows the message", () => {
    render(
      <GalleryError
        error={new Error("boom")}
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByRole("alert").textContent).toMatch(/boom/u);
  });

  it("shows an error that is not an Error as text", () => {
    render(
      <GalleryError
        error="plain"
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByRole("alert").textContent).toMatch(/plain/u);
  });

  it("tries again when the button is pressed", () => {
    const onRetry = vi.fn<() => void>();
    render(
      <GalleryError
        error={new Error("boom")}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });
});
