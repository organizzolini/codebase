import { ConfigurationService } from "@callidescope/configuration";
import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RunConfigurationService } from "./run-configuration.service";

import type { ResolvedCallidescopeConfiguration } from "@callidescope/configuration";

describe(RunConfigurationService, () => {
  let configurationService: ReturnType<typeof createMock<ConfigurationService>>;
  let service: RunConfigurationService;

  beforeAll(async () => {
    configurationService = createMock<ConfigurationService>();

    ({ instance: service } = await buildTestingModule(RunConfigurationService, {
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
      ],
    }));
  });

  beforeEach(() => {
    configurationService.loadConfigurationFile.mockResolvedValue({
      authored: {},
      configuration: createMock<ResolvedCallidescopeConfiguration>(),
      path: "configuration/callidescope.config.ts",
    });
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(RunConfigurationService, {
      mocks: [ConfigurationService],
    });

    expect(instance).toBeInstanceOf(RunConfigurationService);
  });

  describe("load", () => {
    it("hands back the path the loader settled on, never the one it was given", async () => {
      expect.hasAssertions();

      // A run resolves a project's own configuration relative to this, so the
      // resolved answer is the one that has to travel onward.
      await expect(
        service
          .load({ configurationPath: "elsewhere.ts", workspaceRoot: "/w" })
          .then((loaded) => loaded.path),
      ).resolves.toBe("configuration/callidescope.config.ts");
      expect(configurationService.loadConfigurationFile).toHaveBeenCalledWith({
        configurationPath: "elsewhere.ts",
      });
    });
  });
});
