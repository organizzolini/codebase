import { beforeEach, describe, expect, it, vi } from "vitest";

const repl = vi
  .fn<(module: unknown) => Promise<void>>()
  .mockResolvedValue(undefined);

vi.mock("@nestjs/core", () => ({
  DiscoveryModule: function DiscoveryModule() {
    return undefined;
  },
  repl,
}));

// Mocked so that importing the bootstrap never loads the real command modules.
vi.mock("./installation.module", () => ({
  MainModule: function MainModule() {
    return undefined;
  },
}));

describe("repl bootstrap", () => {
  beforeEach(() => {
    repl.mockClear();
    vi.resetModules();
  });

  it("starts the nest repl for the main module", async () => {
    expect.hasAssertions();

    await import("./installation.repl");

    expect(repl).toHaveBeenCalledTimes(1);
  });
});
