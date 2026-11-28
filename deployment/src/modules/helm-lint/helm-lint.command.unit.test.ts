import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { HelmLintCommand } from "./helm-lint.command";
import { HelmLintService } from "./helm-lint.service";

describe(HelmLintCommand, () => {
  const moduleOptions = { mocks: [HelmLintService] };
  const originalExitCode = process.exitCode;
  const lint = vi.fn<HelmLintService["lint"]>();
  const messages: string[] = [];

  /** Runs the command over a fake service. */
  const runCommand = async (): Promise<void> => {
    const { module } = await buildTestingModule(HelmLintCommand, {
      providers: [{ provide: HelmLintService, useValue: { lint } }],
    });

    const subject = await module.resolve(HelmLintCommand);

    await subject.run();
  };

  beforeEach(() => {
    process.exitCode = undefined;
    lint.mockReset();
    messages.length = 0;
    vi.spyOn(console, "error").mockImplementation((line: unknown): void => {
      messages.push(String(line));
    });
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      HelmLintCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(HelmLintCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(HelmLintCommand, moduleOptions);
  });

  it("exits with the status of the lint", async () => {
    expect.hasAssertions();

    lint.mockReturnValue(1);
    await runCommand();

    expect(process.exitCode).toBe(1);
  });

  it("exits 1 with the reason when discovery fails", async () => {
    expect.hasAssertions();

    lint.mockImplementation(() => {
      throw new Error("bad release.yaml");
    });
    await runCommand();

    expect(messages).toStrictEqual(["bad release.yaml"]);
    expect(process.exitCode).toBe(1);
  });
});
