import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTemporaryDirectory,
  FakeProcessRunner,
  writeFileTree,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { VALUES_GLOB } from "./release-images.constants";
import { ReleaseImagesService } from "./release-images.service";

const API_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-api.yaml";

const BASE_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/base.yaml";

const CLI_VALUES =
  "infrastructure/helm/kubernetes-job/values/caelundas-cli.yaml";

const WEB_VALUES =
  "infrastructure/helm/kubernetes-deployment/values/caelundas-web.yaml";

const THIRD_PARTY_VALUES = "infrastructure/helm/cloudflared/values/base.yaml";

/** Values files as found, with comments and blank lines. */
const VALUES = {
  [API_VALUES]:
    '# api\nimage:\n  repository: ghcr.io/organizzolini/caelundas-api\n  # filled by the release\n  tag: ""\n',
  [BASE_VALUES]: "image:\n  tag: ignored\n",
  [CLI_VALUES]:
    'image:\n  repository: ghcr.io/organizzolini/caelundas-cli\n  # filled by the release\n  tag: ""\n\njob: {}\n',
  [THIRD_PARTY_VALUES]: "image:\n  repository: cloudflare/cloudflared\n",
  [WEB_VALUES]: "image:\n  repository: ghcr.io/organizzolini/caelundas-web\n",
};

const PUSH =
  "env IMAGE_TAG=2.0.0 pnpm exec nx run-many --target=docker:push --projects=caelundas-api,caelundas-cli,caelundas-web --parallel=1 --nxBail";

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

  /** Reads a file from the temporary workspace. */
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

  it("pushes every image in one run before writing any tag", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    const atPush: string[] = [];

    runner.effects[PUSH] = () => {
      atPush.push(read(API_VALUES), read(CLI_VALUES), read(WEB_VALUES));
    };

    const service = await buildService(runner);

    service.run("2.0.0");

    expect(runner.lines).toStrictEqual([PUSH]);
    expect(atPush).toStrictEqual([
      VALUES[API_VALUES],
      VALUES[CLI_VALUES],
      VALUES[WEB_VALUES],
    ]);
  });

  it("writes the tag into each file that names an image, keeping comments", async () => {
    expect.hasAssertions();

    const service = await buildService(new FakeProcessRunner({}));

    service.run("2.0.0");

    expect(read(API_VALUES)).toBe(
      '# api\nimage:\n  repository: ghcr.io/organizzolini/caelundas-api\n  # filled by the release\n  tag: "2.0.0"\n',
    );
    expect(read(CLI_VALUES)).toBe(
      'image:\n  repository: ghcr.io/organizzolini/caelundas-cli\n  # filled by the release\n  tag: "2.0.0"\n\njob: {}\n',
    );
    expect(read(WEB_VALUES)).toBe(
      "image:\n  repository: ghcr.io/organizzolini/caelundas-web\n  tag: 2.0.0\n",
    );
    expect(read(BASE_VALUES)).toBe(VALUES[BASE_VALUES]);
    expect(read(THIRD_PARTY_VALUES)).toBe(VALUES[THIRD_PARTY_VALUES]);
  });

  it("releases a fourth image from its values file alone", async () => {
    expect.hasAssertions();

    const fourth =
      "infrastructure/helm/kubernetes-deployment/values/other.yaml";

    writeFileTree(workspace, {
      [fourth]: "image:\n  repository: ghcr.io/organizzolini/other\n",
    });

    const runner = new FakeProcessRunner({});
    const service = await buildService(runner);

    service.run("2.0.0");

    expect(runner.lines[0]).toContain(
      "--projects=caelundas-api,caelundas-cli,caelundas-web,other ",
    );
    expect(read(fourth)).toContain("tag: 2.0.0");
  });

  it("prints the push on a dry run, still writing the tags", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    const service = await buildService(runner, "1");

    service.run("2.0.0");

    expect(runner.streamed).toHaveLength(0);
    expect(console.info).toHaveBeenCalledWith(`🌵 Dry run, would run: ${PUSH}`);
    expect(read(CLI_VALUES)).toContain('tag: "2.0.0"');
  });

  it("writes no tag when the push fails", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({}, 0, { [PUSH]: 1 });
    const service = await buildService(runner);

    expect(() => {
      service.run("2.0.0");
    }).toThrow(`${PUSH} exited 1`);
    expect(read(API_VALUES)).toBe(VALUES[API_VALUES]);
    expect(read(CLI_VALUES)).toBe(VALUES[CLI_VALUES]);
    expect(read(WEB_VALUES)).toBe(VALUES[WEB_VALUES]);
  });

  it("fails when no values file names an image", async () => {
    expect.hasAssertions();

    fs.rmSync(path.join(workspace, "infrastructure/helm/kubernetes-job"), {
      recursive: true,
    });
    fs.rmSync(
      path.join(workspace, "infrastructure/helm/kubernetes-deployment"),
      { recursive: true },
    );

    const runner = new FakeProcessRunner({});
    const service = await buildService(runner);

    expect(() => {
      service.run("2.0.0");
    }).toThrow("No Helm values file sets image.repository");
    expect(runner.lines).toStrictEqual([]);
  });

  it("refuses a version that is not a release version", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    const service = await buildService(runner);

    expect(() => {
      service.run("latest");
    }).toThrow('"latest" is not a release version');
    expect(runner.lines).toStrictEqual([]);
  });

  it("commits the same glob semantic-release does", () => {
    expect.hasAssertions();

    const config = fs.readFileSync(
      path.join(
        import.meta.dirname,
        "../../../../configuration/repository/release.config.cjs",
      ),
      "utf8",
    );

    expect(config).toContain(`"${VALUES_GLOB}"`);
  });
});
