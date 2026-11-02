import {
  ConfigurationModule,
  ConfigurationPathRequiredError,
  InputError,
  ProjectConfigurationError,
  ProjectConfigurationFieldNotPermittedError,
} from "@callidescope/configuration";
import { ProgramConfigurationError } from "@callidescope/graph";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { captureExitCode, captureOutput } from "@codebase/testing";
import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { LimitsCommand } from "./limits.command";
import { LimitsService } from "./limits.service";
import { RenderLimitsService } from "./render-limits.service";

import type { LoggerService } from "@codebase/observability";
import type { CapturedOutput } from "@codebase/testing";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** The workspace configuration every run must be pointed at with `--config`. */
const CONFIGURATION_PATH = "callidescope.config.ts";

/** What the command is built from in every test that builds it. */
const COMMAND_MODULE: TestingModuleOptions = {
  imports: [ConfigurationModule],
  mocks: [LimitsService, RenderLimitsService],
};

describe(LimitsCommand, () => {
  let command: LimitsCommand;
  let exitCode: ReturnType<typeof captureExitCode>;
  let output: CapturedOutput;
  let limitsService: LimitsService;
  let logger: LoggerService;
  let renderLimitsService: RenderLimitsService;

  beforeAll(async () => {
    const built = await buildTestingModule(LimitsCommand, COMMAND_MODULE);

    command = built.instance;
    limitsService = built.mock(LimitsService);
    logger = built.logger;
    renderLimitsService = built.mock(RenderLimitsService);
  });

  beforeEach(() => {
    vi.mocked(limitsService.list).mockResolvedValue([]);
    vi.mocked(renderLimitsService.render).mockReturnValue("rendered");
    vi.mocked(logger.error).mockClear();
    output = captureOutput();
    exitCode = captureExitCode();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      LimitsCommand,
      COMMAND_MODULE,
    );

    expect(instance).toBeInstanceOf(LimitsCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(LimitsCommand, COMMAND_MODULE);
  });

  it("writes the rendered listing to standard output", async () => {
    await command.run([], { config: CONFIGURATION_PATH });

    expect(output.stdout()).toBe("rendered\n");
  });

  it("renders the rows the service resolved", async () => {
    const rows = [
      {
        limit: "maximumDepth" as const,
        origin: "declared" as const,
        path: "configuration/callidescope.config.ts",
        project: undefined,
        value: 17,
      },
    ];

    vi.mocked(limitsService.list).mockResolvedValue(rows);

    await command.run([], { config: CONFIGURATION_PATH });

    expect(renderLimitsService.render).toHaveBeenCalledWith(rows);
  });

  it("passes the configuration path it was given to the service", async () => {
    await command.run([], { config: "configuration/callidescope.config.ts" });

    expect(limitsService.list).toHaveBeenCalledWith({
      config: "configuration/callidescope.config.ts",
    });
  });

  it("leaves the exit code alone, because it gates nothing", async () => {
    await command.run([], { config: CONFIGURATION_PATH });

    expect(exitCode()).toBeUndefined();
  });

  it("reads the configuration path it is given, and refuses a blank one", () => {
    expect(command.parseConfig("callidescope.config.ts")).toBe(
      "callidescope.config.ts",
    );
    expect(() => command.parseConfig(" ")).toThrow(
      ConfigurationPathRequiredError,
    );
    expect(() => command.parseConfig(undefined)).toThrow(
      "--config is required",
    );
  });

  // The headline is per refusal class rather than one word for all three, so a
  // listing says which kind of file it could not read — the same headlines a
  // trace, a depth, and a breadth print, because all four read one classifier.
  it.each([
    [
      "a project configuration that could not be read",
      new ProjectConfigurationError({
        cause: new Error("Unexpected token"),
        configurationPath: "packages/alpha/callidescope.config.ts",
        project: "packages/alpha",
      }),
      "🔭 Rejected a project configuration",
    ],
    [
      "a project configuration setting a workspace-only field",
      new ProjectConfigurationFieldNotPermittedError({
        field: "output",
        project: "packages/alpha",
      }),
      "🔭 Rejected a project configuration",
    ],
    [
      "a project directory holding no tsconfig",
      new ProgramConfigurationError({
        configurationPath: "packages/alpha/tsconfig.json",
        messages: ["missing"],
      }),
      "🔭 Rejected a project it could not read",
    ],
    [
      "a command line the input service refused",
      new InputError("not a format"),
      "🔭 Rejected the command line",
    ],
  ])(
    "fails the run and prints nothing for %s",
    async (_name, error, headline) => {
      vi.mocked(limitsService.list).mockRejectedValue(error);

      await command.run([], { config: CONFIGURATION_PATH });

      expect(output.stdout()).toBe("");
      expect(exitCode()).toBe(1);
      expect(logger.error).toHaveBeenCalledWith(headline, undefined, {
        reason: error.message,
      });
    },
  );

  it("lets an unexpected failure through rather than reporting it as a refusal", async () => {
    vi.mocked(limitsService.list).mockRejectedValue(new Error("boom"));

    await expect(
      command.run([], { config: CONFIGURATION_PATH }),
    ).rejects.toThrow("boom");
  });
});
