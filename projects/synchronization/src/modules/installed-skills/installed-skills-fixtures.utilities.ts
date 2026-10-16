import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type {
  FakeProcessBehavior,
  FakeProcessRunner,
  ProcessResult,
} from "./installed-skills.types";

/**
 * Fakes `git`, `pnpm`, and `skills` over a real workspace on disk.
 *
 * A successful restore installs every skill the lockfile declares, the way
 * `skills experimental_install` does; a failed one installs nothing. A
 * `git diff --quiet` answers from the behavior, flipping to dirty once a
 * restore has run when the behavior says it rewrites something.
 */
export function createFakeProcessRunner(
  workspace: string,
  behavior: FakeProcessBehavior = {},
): FakeProcessRunner {
  const commands: string[] = [];
  let restored = false;

  const restore = (): ProcessResult => {
    restored = true;
    if (behavior.restoreFails === true) {
      return { available: true, status: 1 };
    }
    const { skills } = JSON.parse(
      readFileSync(path.join(workspace, "skills-lock.json"), "utf8"),
    ) as { skills: Record<string, unknown> };
    for (const name of Object.keys(skills)) {
      installSkill(workspace, name);
    }
    if (behavior.corruptsLockfile === true) {
      writeFileSync(path.join(workspace, "skills-lock.json"), "{");
    }
    return { available: true, status: 0 };
  };

  const isLockfileDirty = (): boolean =>
    behavior.lockfileDirtyBefore === true ||
    (restored && behavior.dirtiesLockfile === true);

  const isDirty = (args: readonly string[]): boolean => {
    if (!args.includes("diff")) {
      return false;
    }
    if (args.includes("skills-lock.json")) {
      return isLockfileDirty();
    }
    const folder = args.at(-1) ?? "";
    if (behavior.dirtySkillFolderBefore === folder) {
      return true;
    }
    return restored && behavior.dirtiesSkillFolders === true;
  };

  const answerGit = (args: readonly string[]): ProcessResult => {
    if (behavior.outsideWorkTree === true) {
      return { available: true, status: 128 };
    }
    return { available: true, status: isDirty(args) ? 1 : 0 };
  };

  return {
    commands,
    run: (command) => {
      commands.push([command.executable, ...command.args].join(" "));
      if (command.executable === "git") {
        return answerGit(command.args);
      }
      if (behavior.skillsUnavailable === true) {
        return { available: false, status: null };
      }
      return restore();
    },
  };
}

/** Puts one skill's SKILL.md on disk. */
export function installSkill(workspace: string, skillName: string): void {
  const directory = path.join(workspace, ".agents", "skills", skillName);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "SKILL.md"), `# ${skillName}\n`);
}

/** Writes a lockfile declaring exactly these skills. */
export function lockSkills(workspace: string, skillNames: string[]): void {
  writeFileSync(
    path.join(workspace, "skills-lock.json"),
    JSON.stringify({
      skills: Object.fromEntries(
        skillNames.map((name) => [name, { source: "owner/repository" }]),
      ),
      version: 1,
    }),
  );
}
