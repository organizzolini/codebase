import { describe, expect, it } from "vitest";

import { resolvePluginService } from "./plugin-context.utilities";
import { PluginService } from "./plugin.service";

describe(resolvePluginService, () => {
  it("resolves the plugin service from the application context", async () => {
    expect.hasAssertions();
    await expect(resolvePluginService()).resolves.toBeInstanceOf(PluginService);
  });

  it("builds one context for every caller in the process", async () => {
    expect.hasAssertions();

    const [first, second] = await Promise.all([
      resolvePluginService(),
      resolvePluginService(),
    ]);

    expect(first).toBe(second);
  });
});
