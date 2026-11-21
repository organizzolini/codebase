import { vi } from "vitest";

/**
 * jsdom has no animations, and the nested option menu's scroll area asks for
 * them. A stand-in for a test file that opens the menu, kept out of the shared
 * setup because every other popup waits differently once it exists. Each test
 * file runs in its own environment, so nothing needs restoring.
 */
export function stubAnimations(): void {
  Element.prototype.getAnimations = vi.fn<Element["getAnimations"]>(() => []);
}
