import { afterEach, describe, expect, it, vi } from "vitest";

const replMock = vi.fn<() => Promise<void>>(async (): Promise<void> => {});

vi.mock("@nestjs/core", () => ({
  repl: replMock,
}));

vi.mock("./coinagerie-cli.module.js", () => ({
  MainModule: (): void => {},
}));

describe("repl bootstrap", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts the NestJS repl with the main module", async () => {
    await import("./coinagerie-cli.repl.js");

    await vi.waitFor(() => {
      expect(replMock).toHaveBeenCalledTimes(1);
    });

    expect(replMock).toHaveBeenCalledWith(expect.any(Function));
  }, 15_000);
});
