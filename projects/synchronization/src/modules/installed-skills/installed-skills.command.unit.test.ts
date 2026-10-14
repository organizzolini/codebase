import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/logging";

import { expectProcessExitOne } from "../../../testing/mocks";
import { SynchronizationService } from "../synchronization/synchronization.service";

import { InstalledSkillsCommand } from "./installed-skills.command";
import { InstalledSkillsService } from "./installed-skills.service";

import type { MockInstance } from "vitest";

/**
 * Fixtures live inside the workspace, in its gitignored `tmp`, never in the
 * operating system's temporary directory.
 */
const FIXTURE_PARENT = path.resolve(import.meta.dirname, "../../../tmp");

describe(InstalledSkillsCommand, () => {
  let command: InstalledSkillsCommand;
  let workspace: string;
  let stdout: MockInstance<typeof process.stdout.write>;

  /** Writes a lockfile declaring exactly these skills. */
  const lockSkills = (skillNames: string[]): void => {
    writeFileSync(
      path.join(workspace, "skills-lock.json"),
      JSON.stringify({
        skills: Object.fromEntries(
          skillNames.map((name) => [name, { source: "owner/repository" }]),
        ),
        version: 1,
      }),
    );
  };

  /** Puts one skill's SKILL.md on disk. */
  const installSkill = (skillName: string): void => {
    const directory = path.join(workspace, ".agents", "skills", skillName);
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, "SKILL.md"), `# ${skillName}\n`);
  };

  /** Everything the command wrote to standard output. */
  const printed = (): string =>
    stdout.mock.calls.map(([chunk]) => String(chunk)).join("");

  /** Builds the command over the real service with this environment. */
  const createCommand = async (
    environment: Record<string, string> = {},
  ): Promise<InstalledSkillsCommand> => {
    const module = await Test.createTestingModule({
      providers: [
        InstalledSkillsCommand,
        InstalledSkillsService,
        SynchronizationService,
        { provide: ConfigService, useValue: new ConfigService(environment) },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(InstalledSkillsCommand);
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InstalledSkillsCommand,
        InstalledSkillsService,
        SynchronizationService,
        { provide: ConfigService, useValue: new ConfigService({}) },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(InstalledSkillsCommand);
  });

  beforeEach(() => {
    mkdirSync(FIXTURE_PARENT, { recursive: true });
    workspace = mkdtempSync(path.join(FIXTURE_PARENT, "installed-skills-"));
    vi.spyOn(process, "cwd").mockReturnValue(workspace);
    stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    rmSync(workspace, { force: true, recursive: true });
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        InstalledSkillsCommand,
        InstalledSkillsService,
        SynchronizationService,
        { provide: ConfigService, useValue: new ConfigService({}) },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("InstalledSkillsCommand");
  });

  describe("check", () => {
    it("prints nothing and exits 0 when every locked skill is installed", async () => {
      lockSkills(["alpha", "beta"]);
      installSkill("alpha");
      installSkill("beta");
      await command.run(["check"]);

      expect(printed()).toBe("");
    });

    it("prints nothing and exits 0 when there is no lockfile", async () => {
      await command.run(["check"]);

      expect(printed()).toBe("");
    });

    it("names every missing skill and exits 1", async () => {
      lockSkills(["alpha", "beta", "gamma"]);
      installSkill("beta");
      await expectProcessExitOne(async () => command.run(["check"]));

      expect(printed()).toContain(
        "⚠️  Skills declared in skills-lock.json are not installed: alpha, gamma",
      );
    });

    it("counts a skill folder without SKILL.md as missing", async () => {
      lockSkills(["alpha"]);
      mkdirSync(path.join(workspace, ".agents", "skills", "alpha"), {
        recursive: true,
      });
      await expectProcessExitOne(async () => command.run(["check"]));

      expect(printed()).toContain("are not installed: alpha");
    });

    it("directs a local agent to restore, then ask for a new session", async () => {
      lockSkills(["alpha"]);
      await expectProcessExitOne(async () => command.run(["check"]));

      expect(printed()).toBe(
        [
          "⚠️  Skills declared in skills-lock.json are not installed: alpha",
          '🚨 The agent workflow in AGENTS.md links to these skills. Until they are restored those links dangle, and user-invoked skills such as "/grill-with-docs" are unavailable.',
          "",
          "Action required:",
          '1. Restore them with "pnpm exec nx run codebase:install-skills".',
          "2. Ask the user to start a new session afterwards. Skills register when a session starts, so restoring them does not add them to this one.",
          '3. Re-run "bash scripts/git/validate-session-skills.sh" to confirm.',
        ].join("\n"),
      );
    });

    it.each([{ CI: "true" }, { GITHUB_ACTIONS: "true" }])(
      "directs a cloud agent to its setup workflow under %o",
      async (environment) => {
        lockSkills(["alpha"]);
        const cloudCommand = await createCommand(environment);

        await expectProcessExitOne(async () => cloudCommand.run(["check"]));

        expect(printed()).toContain(
          [
            "Action required:",
            '1. Restore them with "pnpm exec nx run codebase:install-skills".',
            '2. If restoration fails, confirm ".github/workflows/copilot-setup-steps.yml" completed its dependency install, which restores skills through postinstall.',
            "3. Start a fresh cloud agent session so the restored skills register.",
            '4. Re-run "bash scripts/git/validate-session-skills.sh" to confirm.',
          ].join("\n"),
        );
      },
    );

    it("reports an unreadable lockfile rather than calling it complete", async () => {
      writeFileSync(path.join(workspace, "skills-lock.json"), "{ not json");
      await expectProcessExitOne(async () => command.run(["check"]));

      expect(printed()).toContain(
        "⚠️  skills-lock.json could not be read, so whether its skills are installed is unknown",
      );
    });

    it("defaults to check when no mode is passed", async () => {
      lockSkills(["alpha"]);
      await expectProcessExitOne(async () => command.run([]));

      expect(printed()).toContain("are not installed: alpha");
    });
  });
});
