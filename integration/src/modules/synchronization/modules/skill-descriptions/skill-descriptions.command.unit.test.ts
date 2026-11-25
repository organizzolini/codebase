import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { mockProcessExit } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { SkillDescriptionsCommand } from "./skill-descriptions.command";
import { SkillDescriptionsService } from "./skill-descriptions.service";

const moduleOptions = { mocks: [SkillDescriptionsService] };

describe(SkillDescriptionsCommand, () => {
  let command: SkillDescriptionsCommand;
  let skillDescriptionsService: SkillDescriptionsService;
  let reportLines: string[];

  beforeAll(async () => {
    const built = await buildTestingModule(
      SkillDescriptionsCommand,
      moduleOptions,
    );

    command = built.instance;
    skillDescriptionsService = built.mock(SkillDescriptionsService);
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
      skillDescriptionsService.resolveAuthoredSkillPaths,
    ).mockReturnValue([
      ".agents/skills/commit-code/SKILL.md",
      ".agents/skills/write-tests/SKILL.md",
    ]);
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SkillDescriptionsCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SkillDescriptionsCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(SkillDescriptionsCommand, moduleOptions);
  });

  it("reports how many descriptions fit", async () => {
    expect.hasAssertions();

    vi.mocked(
      skillDescriptionsService.findOverlongDescriptions,
    ).mockReturnValue([]);

    await command.run();

    expect(reportLines).toStrictEqual([
      "All 2 authored skill descriptions hold at most 128 words.",
    ]);
  });

  it("reports every overlong description together and exits non-zero", async () => {
    expect.hasAssertions();

    vi.mocked(
      skillDescriptionsService.findOverlongDescriptions,
    ).mockReturnValue([
      { skillPath: ".agents/skills/commit-code/SKILL.md", words: 129 },
      { skillPath: ".agents/skills/write-tests/SKILL.md", words: 200 },
    ]);

    const processExitSpy = mockProcessExit();

    await expect(command.run()).rejects.toThrow("process.exit:1");

    processExitSpy.mockRestore();

    expect(reportLines).toStrictEqual([
      "These skill descriptions hold more than 128 words:",
      "- .agents/skills/commit-code/SKILL.md (129 words)",
      "- .agents/skills/write-tests/SKILL.md (200 words)",
    ]);
  });

  it("tells the user to shorten each description as the fix", () => {
    expect(command.synchronizationLabel).toBe("skill-descriptions");
    expect(command.fixCommand).toBe(
      "shorten each named description to 128 words, moving detail into the skill body",
    );
  });

  it("reports a verdict without exiting when synchronized", async () => {
    expect.hasAssertions();

    vi.mocked(
      skillDescriptionsService.findOverlongDescriptions,
    ).mockReturnValue([
      { skillPath: ".agents/skills/commit-code/SKILL.md", words: 129 },
    ]);

    await expect(command.synchronize()).resolves.toBe(false);
  });
});
