import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { mockProcessExit } from "../../../testing/mocks";

import { LockfileCommand } from "./lockfile.command";
import { LockfileService } from "./lockfile.service";

const moduleOptions = { mocks: [LockfileService] };

describe(LockfileCommand, () => {
  let command: LockfileCommand;
  let lockfileService: LockfileService;
  let reportLines: string[];

  beforeAll(async () => {
    const built = await buildTestingModule(LockfileCommand, moduleOptions);

    command = built.instance;
    lockfileService = built.mock(LockfileService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    reportLines = [];
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.spyOn(console, "warn").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.spyOn(console, "error").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      LockfileCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(LockfileCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(LockfileCommand, moduleOptions);
  });

  it("reports a lockfile that is in sync", async () => {
    expect.hasAssertions();

    vi.mocked(lockfileService.checkLockfile).mockReturnValue({
      available: true,
      output: "Already up to date",
      succeeded: true,
    });

    await command.run();

    expect(reportLines).toStrictEqual(["🔒 pnpm-lock.yaml is in sync"]);
  });

  it("reports a lockfile that is out of sync, with pnpm's own output", async () => {
    expect.hasAssertions();

    vi.mocked(lockfileService.checkLockfile).mockReturnValue({
      available: true,
      output: "specifiers in the lockfile don't match",
      succeeded: false,
    });

    const processExitSpy = mockProcessExit();

    await expect(command.run()).rejects.toThrow("process.exit:1");

    processExitSpy.mockRestore();

    expect(reportLines).toStrictEqual([
      "❌ pnpm-lock.yaml is out of sync with package.json files",
      "💡 Run 'pnpm install' to update the lockfile and try committing again",
      "",
      "pnpm output:",
      "specifiers in the lockfile don't match",
    ]);
  });

  it("passes, with a warning, when pnpm cannot be found", async () => {
    expect.hasAssertions();

    vi.mocked(lockfileService.checkLockfile).mockReturnValue({
      available: false,
      output: "",
      succeeded: false,
    });

    await command.run();

    expect(reportLines).toStrictEqual([
      "⚠️  pnpm not found in PATH; skipping lockfile check",
    ]);
  });
});
