import { beforeAll, describe, expect, it } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { expectProcessExitOne } from "../../../testing/mocks";
import { SynchronizationService } from "../synchronization/synchronization.service";

import { ConventionalConfigCommand } from "./conventional-config.command";
import { ConventionalConfigService } from "./conventional-config.service";

import type { LoggerService } from "@codebase/observability";

const moduleOptions = {
  mocks: [ConventionalConfigService],
  providers: [SynchronizationService],
};

describe(ConventionalConfigCommand, () => {
  let command: ConventionalConfigCommand;
  let logger: LoggerService;

  let conventionalConfigService: DeepMocked<ConventionalConfigService>;

  beforeAll(async () => {
    const built = await buildTestingModule(
      ConventionalConfigCommand,
      moduleOptions,
    );

    command = built.instance;
    logger = built.logger;
    conventionalConfigService = built.mock(ConventionalConfigService);
  });

  it.each([
    {
      expectedMode: "check",
      modeArguments: [],
      scenarioName: "runs synchronization in check mode by default",
    },
    {
      expectedMode: "write",
      modeArguments: ["write"],
      scenarioName: "runs synchronization with the provided mode",
    },
  ])("$scenarioName", async ({ expectedMode, modeArguments }) => {
    await command.run(modeArguments);

    expect(conventionalConfigService.runSynchronization).toHaveBeenCalledWith(
      expectedMode,
    );
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      ConventionalConfigCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(ConventionalConfigCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(ConventionalConfigCommand, moduleOptions);
  });

  it("exits for invalid mode", async () => {
    await expectProcessExitOne(async () => command.run(["invalid-mode"]));

    expect(logger.error).toHaveBeenCalledWith(
      "🚦 Rejected an unusable mode",
      undefined,
      expect.any(Object),
    );
  });

  it("exits non-zero when synchronization reports drift", async () => {
    conventionalConfigService.runSynchronization.mockReturnValueOnce(false);

    await expectProcessExitOne(async () => command.run(["check"]));

    expect(conventionalConfigService.runSynchronization).toHaveBeenCalledWith(
      "check",
    );
  });

  it("does not exit when synchronization is already current", async () => {
    conventionalConfigService.runSynchronization.mockReturnValueOnce(true);

    await expect(command.run(["check"])).resolves.toBeUndefined();
  });
});

import type { DeepMocked } from "@golevelup/ts-vitest";
