import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@codebase/presentation";

import { GallerySurface } from "./gallery-surface";

/** Renders a surface with a Open button, and opens it. */
async function openSurface(): Promise<void> {
  render(
    <GallerySurface
      title="Things"
      trigger={<Button>Open</Button>}
    >
      <p>Inside</p>
    </GallerySurface>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByText("Inside");
}

/** Sets what `(min-width: …)` queries answer, by the width the window has. */
function setWidth(width: number): void {
  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    value: (query: string) => {
      const minimum = Number(/\d+/u.exec(query)?.[0] ?? 0);

      return {
        addEventListener: (): void => {},
        addListener: (): void => {},
        matches: width >= minimum,
        media: query,
        removeEventListener: (): void => {},
        removeListener: (): void => {},
      };
    },
    writable: true,
  });
}

describe(GallerySurface, () => {
  it("applies its class name", () => {
    render(
      <GallerySurface
        className="gallery-surface"
        title="Things"
        trigger={<Button>Open</Button>}
      />,
    );

    expect(screen.getByTestId("gallery-surface").className).toBe(
      "gallery-surface",
    );
  });

  it("opens as a popover on a desktop, named by its title", async () => {
    setWidth(1280);
    await openSurface();

    expect(
      screen.getByRole("dialog", { name: "Things" }).textContent,
    ).toContain("Inside");
  });

  it("opens as a drawer on a tablet, headed by its title", async () => {
    setWidth(800);
    await openSurface();

    expect(screen.getByText("Things")).toBeDefined();
    expect(screen.getByText("Inside")).toBeDefined();
  });

  it("opens as a bottom sheet on a phone, headed by its title", async () => {
    setWidth(375);
    await openSurface();

    expect(screen.getByRole("heading", { name: "Things" })).toBeDefined();
    expect(screen.getByText("Inside")).toBeDefined();
  });
});
