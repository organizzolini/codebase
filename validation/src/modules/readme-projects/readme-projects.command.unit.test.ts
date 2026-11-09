import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { mockProcessExit } from "../../../testing/mocks";

import { ReadmeProjectsCommand } from "./readme-projects.command";
import { ReadmeProjectsService } from "./readme-projects.service";

const moduleOptions = { mocks: [ReadmeProjectsService] };

describe(ReadmeProjectsCommand, () => {
  let command: ReadmeProjectsCommand;
  let readmeProjectsService: ReadmeProjectsService;
  let reportLines: string[];

  beforeAll(async () => {
    const built = await buildTestingModule(
      ReadmeProjectsCommand,
      moduleOptions,
    );

    command = built.instance;
    readmeProjectsService = built.mock(ReadmeProjectsService);
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
      readmeProjectsService.resolveWorkspaceProjectPaths,
    ).mockReturnValue(["projects/common/observability", "validation"]);
    vi.mocked(readmeProjectsService.readRootReadme).mockReturnValue(
      "- **[logger](projects/common/observability)** - Shared logger\n- **[validation](validation)** - Checks",
    );
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      ReadmeProjectsCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(ReadmeProjectsCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(ReadmeProjectsCommand, moduleOptions);
  });

  it("reports how many projects the README documents", async () => {
    expect.hasAssertions();

    vi.mocked(
      readmeProjectsService.findUndocumentedProjectPaths,
    ).mockReturnValue([]);

    await command.run();

    expect(reportLines).toStrictEqual([
      "Root README documents all 2 workspace projects.",
    ]);
  });

  it("reports every undocumented project together and exits non-zero", async () => {
    expect.hasAssertions();

    vi.mocked(
      readmeProjectsService.findUndocumentedProjectPaths,
    ).mockReturnValue(["projects/orphan", "projects/stray"]);

    const processExitSpy = mockProcessExit();

    await expect(command.run()).rejects.toThrow("process.exit:1");

    processExitSpy.mockRestore();

    expect(reportLines).toStrictEqual([
      "Root README is missing these workspace projects:",
      "- projects/orphan",
      "- projects/stray",
    ]);
  });
});
