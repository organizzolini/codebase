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

import {
  createFakeProcessRunner,
  installSkill,
  lockSkills,
} from "./installed-skills-fixtures.utilities";
import { InstalledSkillsProcessService } from "./installed-skills-process.service";
import { InstalledSkillsCommand } from "./installed-skills.command";
import { InstalledSkillsService } from "./installed-skills.service";

import type {
  FakeProcessBehavior,
  FakeProcessRunner,
} from "./installed-skills.types";
import type { MockInstance } from "vitest";

/**
 * Fixtures live inside the workspace, in its gitignored `tmp`, never in the
 * operating system's temporary directory.
 */
const FIXTURE_PARENT = path.resolve(import.meta.dirname, "../../../tmp");

const RETRY_HINT = "Retry with 'pnpm exec nx run codebase:install-skills'";

describe(InstalledSkillsCommand, () => {
  let command: InstalledSkillsCommand;
  let workspace: string;
  let stdout: MockInstance<typeof process.stdout.write>;

  /** Everything the command wrote to standard output. */
  const printed = (): string =>
    stdout.mock.calls.map(([chunk]) => String(chunk)).join("");

  /**
   * Builds the command over the real service, with this environment and a
   * fake process runner over the test's workspace.
   */
  const createCommand = async (
    environment: Record<string, string> = {},
    behavior: FakeProcessBehavior = {},
  ): Promise<{
    command: InstalledSkillsCommand;
    logger: LoggerService;
    runner: FakeProcessRunner;
  }> => {
    const runner = createFakeProcessRunner(workspace, behavior);
    const module = await Test.createTestingModule({
      providers: [
        InstalledSkillsCommand,
        InstalledSkillsService,
        SynchronizationService,
        { provide: ConfigService, useValue: new ConfigService(environment) },
        {
          provide: InstalledSkillsProcessService,
          useValue: createMock<InstalledSkillsProcessService>({
            run: runner.run,
          }),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return {
      command: await module.resolve(InstalledSkillsCommand),
      logger: await module.resolve(LoggerService),
      runner,
    };
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InstalledSkillsCommand,
        InstalledSkillsService,
        SynchronizationService,
        { provide: ConfigService, useValue: new ConfigService({}) },
        {
          provide: InstalledSkillsProcessService,
          useValue: createMock<InstalledSkillsProcessService>(),
        },
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
        {
          provide: InstalledSkillsProcessService,
          useValue: createMock<InstalledSkillsProcessService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("InstalledSkillsCommand");
  });

  describe("check", () => {
    it("prints nothing and exits 0 when every locked skill is installed", async () => {
      lockSkills(workspace, ["alpha", "beta"]);
      installSkill(workspace, "alpha");
      installSkill(workspace, "beta");
      await command.run(["check"]);

      expect(printed()).toBe("");
    });

    it("prints nothing and exits 0 when there is no lockfile", async () => {
      await command.run(["check"]);

      expect(printed()).toBe("");
    });

    it("names every missing skill and exits 1", async () => {
      lockSkills(workspace, ["alpha", "beta", "gamma"]);
      installSkill(workspace, "beta");
      await expectProcessExitOne(async () => command.run(["check"]));

      expect(printed()).toContain(
        "⚠️  Skills declared in skills-lock.json are not installed: alpha, gamma",
      );
    });

    it("counts a skill folder without SKILL.md as missing", async () => {
      lockSkills(workspace, ["alpha"]);
      mkdirSync(path.join(workspace, ".agents", "skills", "alpha"), {
        recursive: true,
      });
      await expectProcessExitOne(async () => command.run(["check"]));

      expect(printed()).toContain("are not installed: alpha");
    });

    it("directs a local agent to restore, then ask for a new session", async () => {
      lockSkills(workspace, ["alpha"]);
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
        lockSkills(workspace, ["alpha"]);
        const { command: cloudCommand } = await createCommand(environment);

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

    it("directs the agent to repair a lockfile that is not a JSON object", async () => {
      writeFileSync(path.join(workspace, "skills-lock.json"), "null");
      await expectProcessExitOne(async () => command.run(["check"]));

      expect(printed()).toBe(
        [
          "⚠️  skills-lock.json could not be read, so whether its skills are installed is unknown: TypeError: the lockfile is not a JSON object",
          "",
          "Action required:",
          '1. Repair skills-lock.json, for example with "git checkout -- skills-lock.json".',
          '2. Re-run "bash scripts/git/validate-session-skills.sh" to confirm.',
        ].join("\n"),
      );
    });

    it("defaults to check when no mode is passed", async () => {
      lockSkills(workspace, ["alpha"]);
      await expectProcessExitOne(async () => command.run([]));

      expect(printed()).toContain("are not installed: alpha");
    });
  });

  describe("write", () => {
    it("leaves skills alone when SKIP_SKILLS_INSTALL is set", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, logger, runner } = await createCommand({
        SKIP_SKILLS_INSTALL: "1",
      });

      await command.run(["write"]);

      expect(runner.commands).toStrictEqual([]);
      expect(logger.log).toHaveBeenCalledWith(
        "🤹 Skipped restoring skills because SKIP_SKILLS_INSTALL is set",
      );
    });

    it("runs nothing when every locked skill is already installed", async () => {
      lockSkills(workspace, ["alpha"]);
      installSkill(workspace, "alpha");
      const { command, logger, runner } = await createCommand();

      await command.run(["write"]);

      expect(runner.commands).toStrictEqual([]);
      expect(logger.log).toHaveBeenCalledWith(
        "🤹 Verified every skill in skills-lock.json is already restored",
      );
    });

    it("runs nothing when there is no lockfile", async () => {
      const { command, runner } = await createCommand();

      await command.run(["write"]);

      expect(runner.commands).toStrictEqual([]);
    });

    it("restores missing skills through pnpm when no local skills binary exists", async () => {
      lockSkills(workspace, ["alpha", "beta"]);
      installSkill(workspace, "beta");
      const { command, logger, runner } = await createCommand();

      await command.run(["write"]);

      expect(runner.commands).toContain(
        "pnpm exec skills experimental_install",
      );
      expect(logger.log).toHaveBeenCalledWith(
        "🤹 Restoring the skills missing from skills-lock.json",
        undefined,
        { count: 1, skills: ["alpha"] },
      );
      expect(logger.log).toHaveBeenCalledWith(
        "✅ Restored every skill declared in skills-lock.json",
      );
    });

    it("prefers the skills binary in node_modules", async () => {
      lockSkills(workspace, ["alpha"]);
      const binary = path.join(workspace, "node_modules", ".bin", "skills");
      mkdirSync(path.dirname(binary), { recursive: true });
      writeFileSync(binary, "");
      const { command, runner } = await createCommand();

      await command.run(["write"]);

      expect(runner.commands).toContain(`${binary} experimental_install`);
    });

    it("re-restores present skills when SKILLS_INSTALL_FORCE is set", async () => {
      lockSkills(workspace, ["alpha"]);
      installSkill(workspace, "alpha");
      const { command, logger, runner } = await createCommand({
        SKILLS_INSTALL_FORCE: "1",
      });

      await command.run(["write"]);

      expect(runner.commands).toContain(
        "pnpm exec skills experimental_install",
      );
      expect(logger.log).toHaveBeenCalledWith(
        "🤹 Restoring every skill because SKILLS_INSTALL_FORCE is set",
      );
    });

    it("prints the retry hint and exits 0 when restoration fails", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, logger } = await createCommand(
        {},
        { restoreFails: true },
      );

      await command.run(["write"]);

      expect(logger.warn).toHaveBeenCalledWith(
        "⚠️ Failed completing the skill restoration",
      );
      expect(logger.warn).toHaveBeenCalledWith(
        "⚠️ Detected skills still missing after the restoration",
        undefined,
        { hint: RETRY_HINT, skills: ["alpha"] },
      );
    });

    it("prints the retry hint and exits 0 when no skills CLI can start", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, logger } = await createCommand(
        {},
        { skillsUnavailable: true },
      );

      await command.run(["write"]);

      expect(logger.warn).toHaveBeenCalledWith(
        "⚠️ Failed starting the skills CLI, so the locked skills stay missing",
        undefined,
        { hint: RETRY_HINT },
      );
    });

    it("reports an unreadable lockfile as such and restores nothing", async () => {
      writeFileSync(path.join(workspace, "skills-lock.json"), "{ not json");
      const { command, logger, runner } = await createCommand();

      await command.run(["write"]);

      expect(runner.commands).toStrictEqual([]);
      expect(logger.warn).toHaveBeenCalledWith(
        "⚠️ Failed reading skills-lock.json, so no skill was restored and none was verified",
        undefined,
        expect.objectContaining({ hint: RETRY_HINT }),
      );
    });

    it("says so when the lockfile cannot be re-read after the restore", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, logger } = await createCommand(
        {},
        { corruptsLockfile: true },
      );

      await command.run(["write"]);

      expect(logger.warn).toHaveBeenCalledWith(
        "⚠️ Failed re-reading skills-lock.json to confirm the restoration",
        undefined,
        expect.objectContaining({ hint: RETRY_HINT }),
      );
      expect(logger.log).not.toHaveBeenCalledWith(
        "✅ Restored every skill declared in skills-lock.json",
      );
    });

    it("reverts the hashes a restore rewrites in a clean lockfile", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, runner } = await createCommand(
        {},
        { dirtiesLockfile: true },
      );

      await command.run(["write"]);

      expect(runner.commands).toContain("git checkout -- skills-lock.json");
    });

    it("keeps a lockfile that already had uncommitted changes", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, runner } = await createCommand(
        {},
        { dirtiesLockfile: true, lockfileDirtyBefore: true },
      );

      await command.run(["write"]);

      expect(runner.commands).not.toContain("git checkout -- skills-lock.json");
    });

    it("returns tracked skill folders to their committed content", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, runner } = await createCommand(
        {},
        { dirtiesSkillFolders: true },
      );

      await command.run(["write"]);

      expect(runner.commands).toContain("git checkout -- .agents/skills");
    });

    it("touches no tracked file when nothing was rewritten", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, runner } = await createCommand();

      await command.run(["write"]);

      expect(
        runner.commands.filter((line) => line.startsWith("git checkout")),
      ).toStrictEqual([]);
    });

    it("runs no git command outside a work tree", async () => {
      lockSkills(workspace, ["alpha"]);
      const { command, runner } = await createCommand(
        {},
        { outsideWorkTree: true },
      );

      await command.run(["write"]);

      expect(
        runner.commands.filter((line) => line.startsWith("git ")),
      ).toStrictEqual(["git rev-parse --is-inside-work-tree"]);
    });
  });
});
