import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRepl = vi.fn<(module: unknown) => Promise<void>>(async () => {});

vi.mock("@nestjs/core", () => {
  return {
    repl: mockRepl,
  };
});

vi.mock("./conformetry-cli.module", () => {
  function MockMainModule(): void {}

  return {
    MainModule: MockMainModule,
  };
});

describe("repl bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    mockRepl.mockClear();
  });

  it("starts NestJS repl with main module", async () => {
    await import("./conformetry-cli.repl");

    expect(mockRepl).toHaveBeenCalledTimes(1);

    const [moduleArgument] = mockRepl.mock.calls[0] ?? [];

    expect(moduleArgument).toBeDefined();
  });
});
