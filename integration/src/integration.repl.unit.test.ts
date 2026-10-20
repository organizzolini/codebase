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

// The real root module imports every command's module graph, which costs
// seconds to load on CI; the bootstrap only hands it to `repl`.
const mainModule = { name: "MainModule" };

vi.mock("./integration.module", () => ({ MainModule: mainModule }));

describe("repl bootstrap", () => {
  beforeEach(() => {
    repl.mockClear();
    vi.resetModules();
  });

  it("starts the nest repl for the main module", async () => {
    expect.hasAssertions();

    await import("./integration.repl");

    expect(repl).toHaveBeenCalledExactlyOnceWith(mainModule);
  });
});
