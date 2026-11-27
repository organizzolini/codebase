import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { createTemporaryDirectory, writeFileTree } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";

import { ImageTagsCommand } from "./image-tags.command";
import { ImageTagsService } from "./image-tags.service";

const API_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-api.yaml";

const CLI_VALUES =
  "infrastructure/helm/kubernetes-job/values/caelundas-cli.yaml";

const WEB_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-web.yaml";

describe(ImageTagsCommand, () => {
  let workspace: string;

  const moduleOptions = { mocks: [ImageTagsService] };
  const originalExitCode = process.exitCode;

  /** Runs the command with the given arguments. */
  const runCommand = async (parameters: string[]): Promise<void> => {
    const { module } = await buildTestingModule(ImageTagsCommand, {
      providers: [
        ImageTagsService,
        { provide: ConfigService, useValue: new ConfigService() },
      ],
    });
    const subject = await module.resolve(ImageTagsCommand);

    await subject.run(parameters);
  };

  beforeEach(() => {
    process.exitCode = undefined;
    workspace = createTemporaryDirectory("workspace", TEMPORARY_ROOT);
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    writeFileTree(workspace, {
      [API_VALUES]:
        "image:\n  repository: ghcr.io/organizzolini/caelundas-api\n",
      [CLI_VALUES]:
        "image:\n  repository: ghcr.io/organizzolini/caelundas-cli\n",
      [WEB_VALUES]:
        "image:\n  repository: ghcr.io/organizzolini/caelundas-web\n",
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
      ImageTagsCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(ImageTagsCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(ImageTagsCommand, moduleOptions);
  });

  it("tags every image and exits 0", async () => {
    expect.hasAssertions();

    await runCommand(["1.2.3"]);

    expect(fs.readFileSync(path.join(workspace, CLI_VALUES), "utf8")).toBe(
      "image:\n  repository: ghcr.io/organizzolini/caelundas-cli\n  tag: 1.2.3\n",
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("exits 1 and says why when the version is missing", async () => {
    expect.hasAssertions();

    await runCommand([]);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      '❌ "" is not a release version',
    );
    expect(process.exitCode).toBe(1);
  });
});
