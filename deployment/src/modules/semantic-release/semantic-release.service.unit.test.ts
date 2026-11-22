import path from "node:path";

import semanticRelease from "semantic-release";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTemporaryDirectory, writeFileTree } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";

import { RELEASE_CONFIGURATION_PATH } from "./semantic-release.constants";
import { SemanticReleaseService } from "./semantic-release.service";

vi.mock("semantic-release", () => ({
  default: vi.fn<() => Promise<false>>(),
}));

const CONFIGURATION = `module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    ["@semantic-release/npm", { npmPublish: false }],
  ],
  tagFormat: "v\${version}",
};
`;

describe(SemanticReleaseService, () => {
  const release = vi.mocked(semanticRelease);
  let workspace: string;

  /** Builds the service, over a workspace holding `configuration`. */
  const buildService = async (): Promise<SemanticReleaseService> => {
    const { instance } = await buildTestingModule(SemanticReleaseService);

    return instance;
  };

  beforeEach(() => {
    release.mockReset();
    release.mockResolvedValue(false);
    workspace = createTemporaryDirectory("workspace", TEMPORARY_ROOT);
    writeFileTree(workspace, { [RELEASE_CONFIGURATION_PATH]: CONFIGURATION });
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    vi.spyOn(console, "error").mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SemanticReleaseService);

    expect(instance).toBeInstanceOf(SemanticReleaseService);
  });

  it("runs semantic-release over the repository's own configuration", async () => {
    expect.hasAssertions();

    const service = await buildService();

    await service.release();

    expect(release).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.anything(),
    );

    const [options, environment] = release.mock.calls[0] ?? [];

    expect(options).toStrictEqual({
      branches: ["main"],
      dryRun: false,
      plugins: [
        "@semantic-release/commit-analyzer",
        ["@semantic-release/npm", { npmPublish: false }],
      ],
      tagFormat: "v${version}",
    });
    expect(environment).toMatchObject({ cwd: workspace });
  });

  it("turns Husky's hooks off for the commits it makes", async () => {
    expect.hasAssertions();

    vi.stubEnv("HUSKY", "1");

    const service = await buildService();

    await service.release();

    const [, environment] = release.mock.calls[0] ?? [];

    expect(environment).toMatchObject({ env: { HUSKY: "0" } });

    vi.unstubAllEnvs();
  });

  it("asks for a dry run when told to", async () => {
    expect.hasAssertions();

    const service = await buildService();

    await service.release({ dryRun: true });

    expect(release.mock.calls[0]?.[0]).toMatchObject({ dryRun: true });
  });

  it("reports success when semantic-release finishes", async () => {
    expect.hasAssertions();

    const service = await buildService();

    await expect(service.release()).resolves.toBe(true);
  });

  it("reports failure, and says why, when semantic-release throws", async () => {
    expect.hasAssertions();

    release.mockRejectedValue(new Error("no token"));

    const service = await buildService();

    await expect(service.release()).resolves.toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("no token"),
    );
  });

  it("lists every failure an aggregate gathers", async () => {
    expect.hasAssertions();

    release.mockRejectedValue(
      new AggregateError(
        [new Error("no token"), new Error("no rules")],
        "release failed",
      ),
    );

    const service = await buildService();

    await service.release();

    expect(console.error).toHaveBeenCalledWith("no token\nno rules");
  });

  it("reports failure when the configuration is missing", async () => {
    expect.hasAssertions();

    vi.spyOn(process, "cwd").mockReturnValue(path.join(workspace, "elsewhere"));

    const service = await buildService();

    await expect(service.release()).resolves.toBe(false);
    expect(release).not.toHaveBeenCalled();
  });

  it("reports failure when the configuration names no plugins", async () => {
    expect.hasAssertions();

    writeFileTree(workspace, {
      [RELEASE_CONFIGURATION_PATH]: 'module.exports = { branches: ["main"] };',
    });

    const service = await buildService();

    await expect(service.release()).resolves.toBe(false);
    expect(release).not.toHaveBeenCalled();
  });
});
