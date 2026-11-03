import { ConfigurationModule as CodometerConfigurationModule } from "@codometer/configuration";
import {
  ConfigurationListingService,
  RenderConfigurationService,
} from "@codometer/output";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";
import { expectLoggerContext } from "@codebase/observability/testing";
import { captureExitCode, captureOutput } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { ConfigurationCommand } from "./configuration.command";

import type { CapturedOutput } from "@codebase/testing";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** A configuration path every listing run must now name. */
const CONFIG = "codometer.config.ts";

/** What the ConfigurationCommand is built with. */
const DEPENDENCIES = {
  imports: [CodometerConfigurationModule],
  mocks: [ConfigurationListingService, RenderConfigurationService],
} satisfies TestingModuleOptions;

describe(ConfigurationCommand, () => {
  let command: ConfigurationCommand;
  let configurationService: ConfigurationListingService;
  let renderConfigurationService: RenderConfigurationService;
  let logger: LoggerService;
  let output: CapturedOutput;

  beforeAll(async () => {
    const { instance, module } = await buildTestingModule(
      ConfigurationCommand,
      DEPENDENCIES,
    );

    command = instance;
    configurationService = module.get(ConfigurationListingService);
    renderConfigurationService = module.get(RenderConfigurationService);
    logger = module.get(LoggerService);
  });

  beforeEach(() => {
    vi.mocked(configurationService.describeConfigurations).mockResolvedValue({
      described: [],
      rootError: undefined,
    });
    vi.mocked(configurationService.toLimitRows).mockReturnValue([]);
    vi.mocked(renderConfigurationService.render).mockReturnValue("rendered");
    output = captureOutput();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      ConfigurationCommand,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(ConfigurationCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(ConfigurationCommand, DEPENDENCIES);
  });

  it("writes the rendered listing to standard output", async () => {
    await command.run([], { config: CONFIG });

    expect(output.stdout()).toContain("rendered\n");
  });

  it("passes the limits flag through to the renderer", async () => {
    await command.run([], { config: CONFIG, limits: true });

    expect(renderConfigurationService.render).toHaveBeenCalledWith(
      expect.objectContaining({ limitsOnly: true }),
    );
  });

  it("reads the directory it is given, and falls back to the working directory", () => {
    expect(command.parseDirectory("packages/logging")).toBe("packages/logging");
    expect(command.parseDirectory("")).toBe(process.cwd());
    expect(command.parseDirectory(true)).toBe(process.cwd());
  });

  it("hands the configuration it was pointed at to the walk", async () => {
    await command.run([], { config: "configuration/codometer.config.ts" });

    expect(configurationService.describeConfigurations).toHaveBeenCalledWith({
      configurationPath: "configuration/codometer.config.ts",
      workingDirectory: process.cwd(),
    });
  });

  it("reads the configuration path it is given", () => {
    expect(command.parseConfig("configuration/codometer.config.ts")).toBe(
      "configuration/codometer.config.ts",
    );
  });

  it("refuses a run that names no --config, naming the flag", async () => {
    await expect(command.run([], {})).rejects.toThrow("--config is required");
    expect(configurationService.describeConfigurations).not.toHaveBeenCalled();
  });

  it("reads the format it is given, and falls back to markdown", () => {
    expect(command.parseFormat("json")).toBe("json");
    expect(command.parseFormat("")).toBe("markdown");
    expect(command.parseFormat(undefined)).toBe("markdown");
  });

  it("reads the limits flag as set whenever it is present", () => {
    expect(command.parseLimits()).toBe(true);
  });

  it("counts the configurations it could not read when it logs", async () => {
    vi.mocked(configurationService.describeConfigurations).mockResolvedValue({
      described: [
        {
          configuration: undefined,
          directory: "packages/broken",
          error: "Cannot find module",
          path: "packages/broken/codometer.config.ts",
        },
      ],
      rootError: undefined,
    });

    await command.run([], { config: CONFIG });

    expect(logger.info).toHaveBeenCalledWith(
      "🔧 Listed the codometer configuration",
      undefined,
      { configurationCount: 1, unreadableCount: 1 },
    );
  });

  it("fails the run when nothing answers for the walk root, and still writes the listing", async () => {
    const readExitCode = captureExitCode();

    vi.mocked(configurationService.describeConfigurations).mockResolvedValue({
      described: [],
      rootError: "needs a format",
    });

    await command.run([], { config: CONFIG });

    // The listing is what the command exists to produce, so it is still
    // written — but a zero exit code would claim the repository's own
    // exclusions were read when they never were.
    expect(output.stdout()).toContain("rendered\n");
    expect(readExitCode()).toBe(1);
  });

  it("refuses a format it does not know, naming the ones it takes", async () => {
    await expect(
      command.run([], { config: CONFIG, format: "yaml" }),
    ).rejects.toThrow(
      '--format does not accept "yaml". It takes one of json and markdown.',
    );
  });

  it("defaults the format to markdown", async () => {
    await command.run([], { config: CONFIG });

    expect(renderConfigurationService.render).toHaveBeenCalledWith(
      expect.objectContaining({ format: "markdown" }),
    );
  });
});
