import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTemporaryDirectory,
  failed,
  FakeProcessRunner,
  succeeded,
  writeFileTree,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { ReleaseImagesService } from "./release-images.service";

const SHOW =
  "pnpm exec nx show projects --affected --json --base=v1.0.0 --head=HEAD";

const API_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-api.yaml";

const WEB_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-web.yaml";

const CLI_VALUES =
  "infrastructure/helm/kubernetes-job/values/caelundas-cli.yaml";

/** Values files as the release finds them: comments and blank lines to keep. */
const VALUES = {
  [API_VALUES]:
    '# api\nimage:\n  repository: api\n\nhook:\n  image:\n    # migrations\n    tag: ""\n',
  [CLI_VALUES]: 'image:\n  # filled by the release\n  tag: ""\n\njob: {}\n',
  [WEB_VALUES]: "image:\n  repository: web\n",
};

const build = (project: string): string =>
  `env IMAGE_TAG=2.0.0 pnpm exec nx run ${project}:docker-build`;

const push = (project: string): string =>
  `env IMAGE_TAG=2.0.0 pnpm exec nx run ${project}:docker-push`;

describe(ReleaseImagesService, () => {
  /** Builds the service over a scripted runner, with `DRY_RUN` as given. */
  const buildService = async (
    runner: FakeProcessRunner,
    dryRun?: string,
  ): Promise<ReleaseImagesService> => {
    vi.stubEnv("DRY_RUN", dryRun);

    const { instance } = await buildTestingModule(ReleaseImagesService, {
      providers: [
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: runner },
      ],
    });

    return instance;
  };

  /** Reads a values file from the temporary workspace. */
  const read = (file: string): string =>
    fs.readFileSync(path.join(workspace, file), "utf8");

  let workspace: string;

  beforeEach(() => {
    workspace = createTemporaryDirectory("workspace", TEMPORARY_ROOT);
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    writeFileTree(workspace, VALUES);
    vi.spyOn(console, "info").mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(ReleaseImagesService, {
      mocks: [ConfigService, ProcessRunnerService],
    });

    expect(instance).toBeInstanceOf(ReleaseImagesService);
  });

  it("releases only the affected images, keeping the others' tags", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({
      [SHOW]: succeeded('["caelundas-web","caelundas-cli"]'),
    });
    const service = await buildService(runner);

    await service.run("2.0.0", "v1.0.0");

    expect(runner.lines).toStrictEqual([
      SHOW,
      build("caelundas-web"),
      push("caelundas-web"),
      build("caelundas-cli"),
      push("caelundas-cli"),
    ]);
    expect(read(WEB_VALUES)).toBe("image:\n  repository: web\n  tag: 2.0.0\n");
    expect(read(CLI_VALUES)).toBe(
      'image:\n  # filled by the release\n  tag: "2.0.0"\n\njob: {}\n',
    );
    expect(read(API_VALUES)).toContain('    tag: "2.0.0"');
    expect(read(API_VALUES)).not.toContain("  tag: 2.0.0");
  });

  it("releases every image when there is no last tag", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    const service = await buildService(runner);

    await service.run("2.0.0", "");

    expect(runner.streamed).toHaveLength(6);
    expect(runner.lines).not.toContain(SHOW);
    expect(read(API_VALUES)).toBe(
      '# api\nimage:\n  repository: api\n  tag: 2.0.0\n\nhook:\n  image:\n    # migrations\n    tag: "2.0.0"\n',
    );
  });

  it("changes nothing when no image is affected", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({ [SHOW]: succeeded('["lexico"]') });
    const service = await buildService(runner);

    await service.run("2.0.0", "v1.0.0");

    expect(runner.lines).toStrictEqual([SHOW]);
    expect(read(API_VALUES)).toBe(VALUES[API_VALUES]);
  });

  it("prints builds and pushes on a dry run, still writing the tags", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    const service = await buildService(runner, "1");

    await service.run("2.0.0", "");

    expect(runner.streamed).toHaveLength(0);
    expect(console.info).toHaveBeenCalledWith(
      `🌵 Dry run, would run: ${push("caelundas-cli")}`,
    );
    expect(read(CLI_VALUES)).toContain('tag: "2.0.0"');
  });

  it("writes no tag when its build fails", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({}, 0, {
      [build("caelundas-api")]: 1,
    });
    const service = await buildService(runner);

    await expect(service.run("2.0.0", "")).rejects.toThrow(
      `${build("caelundas-api")} exited 1`,
    );
    expect(read(API_VALUES)).toBe(VALUES[API_VALUES]);
  });

  it("fails when the affected projects cannot be listed", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({ [SHOW]: failed("bad base", 128) });
    const service = await buildService(runner);

    await expect(service.run("2.0.0", "v1.0.0")).rejects.toThrow(
      "exited 128: bad base",
    );
  });

  it("refuses a version that is not a release version", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    const service = await buildService(runner);

    await expect(service.run("latest", "")).rejects.toThrow(
      '"latest" is not a release version',
    );
    expect(runner.lines).toStrictEqual([]);
  });
});
