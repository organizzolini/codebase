import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import {
  createTemporaryDirectory,
  FakeProcessRunner,
  writeFileTree,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { ReleaseImagesCommand } from "./release-images.command";
import { ReleaseImagesService } from "./release-images.service";

const API_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-api.yaml";

const CLI_VALUES =
  "infrastructure/helm/kubernetes-job/values/caelundas-cli.yaml";

const WEB_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-web.yaml";

describe(ReleaseImagesCommand, () => {
  let workspace: string;

  const moduleOptions = { mocks: [ReleaseImagesService] };
  const originalExitCode = process.exitCode;

  /** Runs the command over a scripted runner with the given arguments. */
  const runCommand = async (
    runner: FakeProcessRunner,
    parameters: string[],
  ): Promise<void> => {
    const { module } = await buildTestingModule(ReleaseImagesCommand, {
      providers: [
        ReleaseImagesService,
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    });
    const subject = await module.resolve(ReleaseImagesCommand);

    await subject.run(parameters);
  };

  beforeEach(() => {
    process.exitCode = undefined;
    workspace = createTemporaryDirectory("workspace", TEMPORARY_ROOT);
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    writeFileTree(workspace, {
      [API_VALUES]:
        "image:\n  repository: api\nhook:\n  image:\n    tag: old\n",
      [CLI_VALUES]: "image:\n  repository: cli\n",
      [WEB_VALUES]: "image:\n  repository: web\n",
    });
    vi.spyOn(console, "info").mockReturnValue(undefined);
    vi.spyOn(console, "error").mockReturnValue(undefined);
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      ReleaseImagesCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(ReleaseImagesCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(ReleaseImagesCommand, moduleOptions);
  });

  it("releases every image for a first release and exits 0", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    await runCommand(runner, ["1.2.3", ""]);

    expect(runner.streamed).toHaveLength(6);
    expect(fs.readFileSync(path.join(workspace, CLI_VALUES), "utf8")).toBe(
      "image:\n  repository: cli\n  tag: 1.2.3\n",
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("exits 1 and says why when the version is missing", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    await runCommand(runner, []);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      '❌ "" is not a release version',
    );
    expect(process.exitCode).toBe(1);
  });
});
