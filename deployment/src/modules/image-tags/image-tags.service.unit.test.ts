import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTemporaryDirectory, writeFileTree } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";

import { VALUES_GLOB } from "./image-tags.constants";
import { ImageTagsService } from "./image-tags.service";

const API_VALUES =
  "projects/caelundas/caelundas-api/infrastructure/helm-values.yaml";

const BASE_VALUES = "projects/example/untagged/infrastructure/helm-values.yaml";

const CLI_VALUES =
  "projects/caelundas/caelundas-cli/infrastructure/helm-values.yaml";

const WEB_VALUES =
  "projects/caelundas/caelundas-web/infrastructure/helm-values.yaml";

const THIRD_PARTY_VALUES =
  "projects/example/third-party/infrastructure/helm-values.yaml";

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

describe(ImageTagsService, () => {
  /** Builds the service with `DRY_RUN` as given. */
  const buildService = async (dryRun?: string): Promise<ImageTagsService> => {
    vi.stubEnv("DRY_RUN", dryRun);

    const { instance } = await buildTestingModule(ImageTagsService, {
      providers: [{ provide: ConfigService, useValue: new ConfigService() }],
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

    const { instance } = await buildTestingModule(ImageTagsService, {
      mocks: [ConfigService],
    });

    expect(instance).toBeInstanceOf(ImageTagsService);
  });

  it("writes the tag into each file that names an image, keeping comments", async () => {
    expect.hasAssertions();

    const service = await buildService();

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

  it("tags a fourth image from its values file alone", async () => {
    expect.hasAssertions();

    const fourth =
      "projects/caelundas/caelundas-other/infrastructure/helm-values.yaml";

    writeFileTree(workspace, {
      [fourth]: "image:\n  repository: ghcr.io/organizzolini/other\n",
    });

    const service = await buildService();

    service.run("2.0.0");

    expect(read(fourth)).toContain("tag: 2.0.0");
  });

  it("prints the files it would write on a dry run, writing nothing", async () => {
    expect.hasAssertions();

    const service = await buildService("1");

    service.run("2.0.0");

    expect(console.info).toHaveBeenCalledWith(
      `🌵 Dry run, would write image.tag 2.0.0 to ${CLI_VALUES}`,
    );
    expect(console.info).toHaveBeenCalledTimes(3);
    expect(read(API_VALUES)).toBe(VALUES[API_VALUES]);
    expect(read(CLI_VALUES)).toBe(VALUES[CLI_VALUES]);
    expect(read(WEB_VALUES)).toBe(VALUES[WEB_VALUES]);
  });

  it("fails when no values file names an image", async () => {
    expect.hasAssertions();

    fs.rmSync(path.join(workspace, "projects/caelundas"), {
      recursive: true,
    });

    const service = await buildService();

    expect(() => {
      service.run("2.0.0");
    }).toThrow("No Helm values file sets image.repository");
  });

  it("refuses a version that is not a release version", async () => {
    expect.hasAssertions();

    const service = await buildService();

    expect(() => {
      service.run("latest");
    }).toThrow('"latest" is not a release version');
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
