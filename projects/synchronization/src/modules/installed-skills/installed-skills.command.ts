import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { SynchronizationService } from "../synchronization/synchronization.service";

import {
  CLOUD_REMEDIATION,
  LOCAL_REMEDIATION,
  MISSING_SKILLS_CONSEQUENCE,
  RETRY_HINT,
  SESSION_HOOK_COMMAND,
  SKILLS_LOCKFILE,
} from "./installed-skills.constants";
import { InstalledSkillsService } from "./installed-skills.service";

import type {
  SynchronizableCommand,
  SynchronizationMode,
} from "../synchronization/synchronization.types";

/**
 * CLI command that keeps the skills `skills-lock.json` declares installed.
 *
 * `check` lists the locked skills whose `SKILL.md` is absent. Its standard
 * output is the whole report and nothing else, so the skills session hook can
 * hand it to the agent as context unchanged: silent with exit 0 when every
 * skill is present, the missing names and the remediation with exit 1
 * otherwise. The remediation differs for a cloud agent, which installs from a
 * setup workflow, and a local one, which has a terminal.
 *
 * `write` restores the missing ones and is what the root `postinstall` runs.
 * It never fails an install: skills are agent context, not a build input, so
 * an outage or an unreadable lockfile only warns with the command that
 * retries it. `SKIP_SKILLS_INSTALL` leaves skills alone entirely, and
 * `SKILLS_INSTALL_FORCE` restores even when every skill is present, to repair
 * a damaged one.
 */
@Command({
  description: "Check or restore the skills skills-lock.json declares",
  name: "installed-skills",
})
@Injectable()
export class InstalledSkillsCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService,
    private readonly installedSkillsService: InstalledSkillsService,
    private readonly logger: LoggerService,
    private readonly synchronizationModeService: SynchronizationService,
  ) {
    super();
    this.logger.setContext(InstalledSkillsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly synchronizationLabel = "installed-skills";

  // 🔏 Private Methods

  /** Says why a restore is about to run: skills are missing, or it is forced. */
  private announceRestoration(missing: readonly string[]): void {
    if (missing.length > 0) {
      this.logger.log(
        `🤹 Restoring the skills missing from ${SKILLS_LOCKFILE}`,
        undefined,
        { count: missing.length, skills: [...missing] },
      );
      return;
    }

    this.logger.log(
      "🤹 Restoring every skill because SKILLS_INSTALL_FORCE is set",
    );
  }

  /** Reports which locked skills are missing, as session-hook context. */
  private check(): boolean {
    const result = this.installedSkillsService.findMissingSkills();

    if (result.kind === "no-lockfile") {
      return true;
    }

    if (result.kind === "unreadable") {
      this.print(
        [
          `⚠️  ${SKILLS_LOCKFILE} could not be read, so whether its skills are installed is unknown: ${result.reason}`,
          "",
          "Action required:",
          `1. Repair ${SKILLS_LOCKFILE}, for example with "git checkout -- ${SKILLS_LOCKFILE}".`,
          `2. Re-run "${SESSION_HOOK_COMMAND}" to confirm.`,
        ].join("\n"),
      );
      return false;
    }

    if (result.missing.length === 0) {
      this.logger.log("🤹 Verified every locked skill is installed");
      return true;
    }

    this.print(
      [
        `⚠️  Skills declared in ${SKILLS_LOCKFILE} are not installed: ${result.missing.join(", ")}`,
        MISSING_SKILLS_CONSEQUENCE,
        "",
        "Action required:",
        this.isCloudAgent() ? CLOUD_REMEDIATION : LOCAL_REMEDIATION,
      ].join("\n"),
    );
    return false;
  }

  /**
   * Whether a cloud agent is running this, which installs dependencies from a
   * setup workflow rather than a terminal.
   */
  private isCloudAgent(): boolean {
    return (
      Boolean(this.configService.get<string>("GITHUB_ACTIONS")) ||
      Boolean(this.configService.get<string>("CI"))
    );
  }

  /** Whether one of the restore's switches is set to anything at all. */
  private isSet(name: "SKILLS_INSTALL_FORCE" | "SKIP_SKILLS_INSTALL"): boolean {
    return Boolean(this.configService.get<string>(name));
  }

  /** Writes the report itself, which is this command's standard output. */
  private print(report: string): void {
    process.stdout.write(report);
  }

  /** Restores the missing locked skills, never reporting failure. */
  private write(): boolean {
    if (this.isSet("SKIP_SKILLS_INSTALL")) {
      this.logger.log(
        "🤹 Skipped restoring skills because SKIP_SKILLS_INSTALL is set",
      );
      return true;
    }

    const result = this.installedSkillsService.findMissingSkills();

    if (result.kind === "no-lockfile") {
      return true;
    }

    if (result.kind === "unreadable") {
      this.logger.warn(
        `⚠️ Failed reading ${SKILLS_LOCKFILE}, so no skill was restored and none was verified`,
        undefined,
        { hint: RETRY_HINT, reason: result.reason },
      );
      return true;
    }

    const force = this.isSet("SKILLS_INSTALL_FORCE");

    if (result.missing.length === 0 && !force) {
      this.logger.log(
        `🤹 Verified every skill in ${SKILLS_LOCKFILE} is already restored`,
      );
      return true;
    }

    this.announceRestoration(result.missing);
    this.installedSkillsService.restoreSkills();
    return true;
  }

  // 🌎 Public Methods

  /** Runs the installed-skills command in check or write mode. */
  public async run(passedParameters: string[]): Promise<void> {
    const mode =
      this.synchronizationModeService.resolveSynchronizationModeOrExit({
        invalidModeLabel: "Unknown mode",
        loggerService: this.logger,
        passedParameters,
        usageMessage: "Expected 'check' or 'write'",
      });

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }

  /** Checks or restores the installed skills, reporting success. */
  public async synchronize(mode: SynchronizationMode): Promise<boolean> {
    // Nothing here is asynchronous; the interface is, because other
    // synchronizers load configuration.
    await Promise.resolve();

    return mode === "write" ? this.write() : this.check();
  }
}
