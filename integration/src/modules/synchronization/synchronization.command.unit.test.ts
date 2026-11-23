import { beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { expectProcessExitOne } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { SynchronizationCommand } from "./synchronization.command";
import { SYNCHRONIZABLE_COMMANDS } from "./synchronization.constants";
import { SynchronizationService } from "./synchronization.service";

import type { SynchronizableCommand } from "./synchronization.types";

const derivation: SynchronizableCommand = {
  synchronizationLabel: "skill-exclusions",
  synchronize: vi.fn<SynchronizableCommand["synchronize"]>(),
};
const check: SynchronizableCommand = {
  fixCommand: "pnpm install",
  synchronizationLabel: "lockfile",
  synchronize: vi.fn<SynchronizableCommand["synchronize"]>(),
};
const delegates = [derivation, check];

const moduleOptions = {
  providers: [
    SynchronizationService,
    { provide: SYNCHRONIZABLE_COMMANDS, useValue: delegates },
  ],
};

/** Makes every delegate report the same outcome. */
function stubAllDelegates(succeeded: boolean): void {
  for (const delegate of delegates) {
    vi.mocked(delegate.synchronize).mockResolvedValue(succeeded);
  }
}

describe(SynchronizationCommand, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SynchronizationCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(SynchronizationCommand, moduleOptions);
  });

  it("runs every command in the given mode and reports success", async () => {
    expect.hasAssertions();

    const { instance, logger } = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );
    stubAllDelegates(true);

    await expect(instance.synchronize("write")).resolves.toBe(true);

    for (const delegate of delegates) {
      expect(delegate.synchronize).toHaveBeenCalledWith("write");
    }

    expect(logger.info).toHaveBeenCalledWith(
      "🔗 Verified every synchronization",
      undefined,
      expect.any(Object),
    );
  });

  it("verifies vacuously when no command is registered", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(SynchronizationCommand, {
      providers: [
        SynchronizationService,
        { provide: SYNCHRONIZABLE_COMMANDS, useValue: [] },
      ],
    });

    await expect(instance.synchronize("check")).resolves.toBe(true);
  });

  // The whole point of the aggregate: one run surfaces all drift, so a failing
  // command must not stop the ones after it.
  it("runs the remaining commands after one fails and names each fix", async () => {
    expect.hasAssertions();

    const { instance, logger } = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );
    stubAllDelegates(false);
    vi.mocked(derivation.synchronize).mockResolvedValue(false);

    await expect(instance.synchronize("check")).resolves.toBe(false);

    expect(check.synchronize).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      "🔗 Detected out-of-sync synchronizations",
      undefined,
      expect.objectContaining({
        fixes: {
          lockfile: "pnpm install",
          "skill-exclusions":
            "pnpm exec nx run integration:skill-exclusions:write",
        },
      }),
    );
  });

  it("defaults to check mode when no mode is passed", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );
    stubAllDelegates(true);

    await instance.run([]);

    expect(derivation.synchronize).toHaveBeenCalledWith("check");
  });

  it("exits with code 1 when any command reports drift", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );
    stubAllDelegates(true);
    vi.mocked(check.synchronize).mockResolvedValue(false);

    await expectProcessExitOne(async () => {
      await instance.run(["check"]);
    });
  });

  it("exits with code 1 on an unknown mode", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );
    stubAllDelegates(true);

    await expectProcessExitOne(async () => {
      await instance.run(["sideways"]);
    });

    expect(derivation.synchronize).not.toHaveBeenCalled();
  });
});
