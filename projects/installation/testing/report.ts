import { vi } from "vitest";

/** Collects what a step prints through `console.info`, line by line. */
export function captureReport(): string[] {
  const lines: string[] = [];

  vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
    lines.push(String(line));
  });

  return lines;
}
