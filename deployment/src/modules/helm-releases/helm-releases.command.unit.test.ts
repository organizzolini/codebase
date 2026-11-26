import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { HelmReleasesCommand } from "./helm-releases.command";
import { HelmReleasesService } from "./helm-releases.service";

describe(HelmReleasesCommand, () => {
  const moduleOptions = { mocks: [HelmReleasesService] };
  const originalExitCode = process.exitCode;
  const lint = vi.fn<HelmReleasesService["lint"]>();
  const render = vi.fn<HelmReleasesService["render"]>();
  const messages: string[] = [];

  /** Runs the command over a fake service. */
  const runCommand = async (parameters: string[]): Promise<void> => {
    const { module } = await buildTestingModule(HelmReleasesCommand, {
      providers: [{ provide: HelmReleasesService, useValue: { lint, render } }],
    });

    const subject = await module.resolve(HelmReleasesCommand);

    await subject.run(parameters);
  };

  beforeEach(() => {
    process.exitCode = undefined;
    lint.mockReset();
    render.mockReset();
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
      HelmReleasesCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(HelmReleasesCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(HelmReleasesCommand, moduleOptions);
  });

  it("exits with the status of a lint", async () => {
    expect.hasAssertions();

    lint.mockReturnValue(1);
    await runCommand(["lint"]);

    expect(process.exitCode).toBe(1);
  });

  it("renders into the directory given and exits 0", async () => {
    expect.hasAssertions();

    await runCommand(["render", "dist/out"]);

    expect(render).toHaveBeenCalledExactlyOnceWith("dist/out");
    expect(process.exitCode).toBe(0);
  });

  it("exits 1 with the reason when a render fails", async () => {
    expect.hasAssertions();

    render.mockImplementation(() => {
      throw new Error("helm template failed");
    });
    await runCommand(["render", "dist/out"]);

    expect(messages).toStrictEqual(["helm template failed"]);
    expect(process.exitCode).toBe(1);
  });

  it.each([[["render"]], [["publish"]], [[]]])(
    "exits 2 with the usage for %j",
    async (parameters) => {
      expect.hasAssertions();

      await runCommand(parameters);

      expect(messages[0]).toContain("usage: helm-releases");
      expect(process.exitCode).toBe(2);
    },
  );
});
