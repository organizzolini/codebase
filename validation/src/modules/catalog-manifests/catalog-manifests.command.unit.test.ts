import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { mockProcessExit } from "../../../testing/mocks";

import { CatalogManifestsCommand } from "./catalog-manifests.command";
import { CatalogManifestsService } from "./catalog-manifests.service";

const moduleOptions = { mocks: [CatalogManifestsService] };

describe(CatalogManifestsCommand, () => {
  let command: CatalogManifestsCommand;
  let catalogManifestsService: CatalogManifestsService;
  let reportLines: string[];

  beforeAll(async () => {
    const built = await buildTestingModule(
      CatalogManifestsCommand,
      moduleOptions,
    );

    command = built.instance;
    catalogManifestsService = built.mock(CatalogManifestsService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    reportLines = [];
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.spyOn(console, "error").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.mocked(
      catalogManifestsService.resolveWorkspaceManifestPaths,
    ).mockReturnValue([
      "package.json",
      "projects/common/observability/package.json",
    ]);
    vi.mocked(catalogManifestsService.readManifest).mockReturnValue({});
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      CatalogManifestsCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(CatalogManifestsCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(CatalogManifestsCommand, moduleOptions);
  });

  it("reports how many manifests passed", async () => {
    expect.hasAssertions();

    vi.mocked(
      catalogManifestsService.validateManifestDependencies,
    ).mockReturnValue([]);

    await command.run();

    expect(reportLines).toStrictEqual([
      "Catalog policy passed for 2 workspace manifests.",
    ]);
  });

  it("reports every violation together and exits non-zero", async () => {
    expect.hasAssertions();

    vi.mocked(
      catalogManifestsService.validateManifestDependencies,
    ).mockImplementation((manifestPath: string) =>
      manifestPath === "package.json"
        ? ["package.json -> dependencies.zod must use catalog: (found ^3.0.0)"]
        : [
            "projects/common/observability/package.json -> dependencies.pino must use catalog: (found ^9.0.0)",
          ],
    );

    const processExitSpy = mockProcessExit();

    await expect(command.run()).rejects.toThrow("process.exit:1");

    processExitSpy.mockRestore();

    expect(reportLines).toStrictEqual([
      "Catalog policy violations found:",
      "- package.json -> dependencies.zod must use catalog: (found ^3.0.0)",
      "- projects/common/observability/package.json -> dependencies.pino must use catalog: (found ^9.0.0)",
    ]);
  });
});
