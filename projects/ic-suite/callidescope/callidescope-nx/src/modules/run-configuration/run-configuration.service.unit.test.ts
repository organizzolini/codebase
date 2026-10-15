import { ConfigurationService } from "@callidescope/configuration";
import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { RunConfigurationService } from "./run-configuration.service";

import type { ResolvedCallidescopeConfiguration } from "@callidescope/configuration";

describe(RunConfigurationService, () => {
  let configurationService: ReturnType<typeof createMock<ConfigurationService>>;
  let service: RunConfigurationService;

  beforeAll(async () => {
    configurationService = createMock<ConfigurationService>();

    const module = await Test.createTestingModule({
      providers: [
        RunConfigurationService,
        { provide: ConfigurationService, useValue: configurationService },
      ],
    }).compile();

    service = await module.resolve(RunConfigurationService);
  });

  beforeEach(() => {
    configurationService.loadConfigurationFile.mockResolvedValue({
      authored: {},
      configuration: createMock<ResolvedCallidescopeConfiguration>(),
      path: "configuration/callidescope.config.ts",
    });
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
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
