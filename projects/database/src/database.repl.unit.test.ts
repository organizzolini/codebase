import { afterEach, describe, expect, it, vi } from "vitest";

const replMock = vi.fn<() => Promise<void>>(async (): Promise<void> => {});

vi.mock("@nestjs/core", () => ({
  repl: replMock,
}));

vi.mock("./database.module", () => ({
  MainModule: (): void => {},
}));

describe("repl bootstrap", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts NestJS repl with main module", async () => {
    await import("./database.repl");

    await vi.waitFor(() => {
      expect(replMock).toHaveBeenCalledTimes(1);
    });

    expect(replMock).toHaveBeenCalledWith(expect.any(Function));
  }, 15_000);
});
