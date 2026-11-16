import { createMock } from "@golevelup/ts-vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MainModule } from "./documentation.module";

const repl = vi
  .fn<(module: unknown) => Promise<void>>()
  .mockResolvedValue(undefined);
const mainModuleMock = createMock<MainModule>();

vi.mock("@nestjs/core", () => ({
  DiscoveryModule: function DiscoveryModule() {
    return undefined;
  },
  repl,
}));

vi.mock("./documentation.module", () => ({
  MainModule: function MainModule() {
    return mainModuleMock;
  },
}));

describe("repl bootstrap", () => {
  beforeEach(() => {
    repl.mockClear();
    vi.resetModules();
  });

  it("starts the nest repl for the root module", async () => {
    await import("./documentation.repl");

    expect(repl).toHaveBeenCalledTimes(1);
  });
});
