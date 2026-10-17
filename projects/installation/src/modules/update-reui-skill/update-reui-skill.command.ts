import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { UpdateReuiSkillService } from "./update-reui-skill.service";

/**
 * CLI command that refreshes the vendored ReUI skill from the JSON bundle
 * reui.io serves and re-pins it in `skills-lock.json`.
 *
 * Never exits non-zero: a stale skill is agent context, not a broken build.
 */
@Command({
  description:
    "Refresh the vendored ReUI skill from reui.io and re-pin it in skills-lock.json",
  name: "update-reui-skill",
})
@Injectable()
export class UpdateReuiSkillCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly updateReuiSkillService: UpdateReuiSkillService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(UpdateReuiSkillCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Refreshes the skill. */
  public async run(): Promise<void> {
    await this.updateReuiSkillService.update();
  }
}
