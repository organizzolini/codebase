import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { HelmRenderCommand } from "./helm-render.command";
import { HelmRenderService } from "./helm-render.service";

import type { HelmRenderOptions } from "./helm-render.types";

describe(HelmRenderCommand, () => {
  const moduleOptions = { mocks: [HelmRenderService] };
  const originalExitCode = process.exitCode;
  const render = vi.fn<HelmRenderService["render"]>();
  const messages: string[] = [];

  /** Runs the command over a fake service. */
  const runCommand = async (options?: HelmRenderOptions): Promise<void> => {
    const { module } = await buildTestingModule(HelmRenderCommand, {
      providers: [{ provide: HelmRenderService, useValue: { render } }],
    });

    const subject = await module.resolve(HelmRenderCommand);

    await subject.run([], options);
  };

  beforeEach(() => {
    process.exitCode = undefined;
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
      HelmRenderCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(HelmRenderCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(HelmRenderCommand, moduleOptions);
  });

  it("parses --directory as given", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      HelmRenderCommand,
      moduleOptions,
    );

    expect(instance.parseDirectory("dist/out")).toBe("dist/out");
  });

  it("renders into the directory given and exits 0", async () => {
    expect.hasAssertions();

    await runCommand({ directory: "dist/out" });

    expect(render).toHaveBeenCalledExactlyOnceWith("dist/out");
    expect(process.exitCode).toBe(0);
  });

  it("exits 1 with the reason when a render fails", async () => {
    expect.hasAssertions();

    render.mockImplementation(() => {
      throw new Error("helm template failed");
    });
    await runCommand({ directory: "dist/out" });

    expect(messages).toStrictEqual(["helm template failed"]);
    expect(process.exitCode).toBe(1);
  });

  it("exits 1 when the directory is missing", async () => {
    expect.hasAssertions();

    await runCommand();

    expect(render).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
