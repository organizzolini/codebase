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

describe("repl bootstrap", () => {
  beforeEach(() => {
    repl.mockClear();
    vi.resetModules();
  });

  it("starts the nest repl for the synchronization module", async () => {
    await import("./synchronization.repl");

    expect(repl).toHaveBeenCalledTimes(1);
  });
});
