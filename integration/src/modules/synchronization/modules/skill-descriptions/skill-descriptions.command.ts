import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  MAXIMUM_DESCRIPTION_WORDS,
  MAXIMUM_TOTAL_DESCRIPTION_CHARACTERS,
} from "./skill-descriptions.constants";
import { SkillDescriptionsService } from "./skill-descriptions.service";

import type { SynchronizableCommand } from "../../synchronization.types";

/**
 * CLI command that checks every skill this repository authors keeps its
 * description within the word limit, so the agent's skill listing never
 * truncates.
 *
 * Exits 0 when every description fits and 1 when any does not.
 */
@Command({
  description: `Check that every authored skill description holds at most ${String(MAXIMUM_DESCRIPTION_WORDS)} words, and all of them ${String(MAXIMUM_TOTAL_DESCRIPTION_CHARACTERS)} characters`,
  name: "skill-descriptions",
})
@Injectable()
export class SkillDescriptionsCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly skillDescriptionsService: SkillDescriptionsService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SkillDescriptionsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly fixCommand = `shorten the descriptions to ${String(MAXIMUM_DESCRIPTION_WORDS)} words each and ${String(MAXIMUM_TOTAL_DESCRIPTION_CHARACTERS)} characters together, moving detail into the skill bodies`;

  readonly synchronizationLabel = "skill-descriptions";

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Checks every authored skill and exits 0 or 1 on the verdict. */
  public async run(): Promise<void> {
    if (!(await this.synchronize())) {
      process.exit(1);
    }
  }

  /** Checks every authored skill and reports whether all fit. Never writes. */
  public async synchronize(): Promise<boolean> {
    // Nothing here is asynchronous; the contract's signature is.
    await Promise.resolve();

    const workspaceRoot = process.cwd();
    const skillPaths =
      this.skillDescriptionsService.resolveAuthoredSkillPaths(workspaceRoot);
    const overlongDescriptions =
      this.skillDescriptionsService.findOverlongDescriptions(
        workspaceRoot,
        skillPaths,
      );
    const totalCharacters =
      this.skillDescriptionsService.measureTotalCharacters(
        workspaceRoot,
        skillPaths,
      );
    const fitsBudget = totalCharacters <= MAXIMUM_TOTAL_DESCRIPTION_CHARACTERS;

    if (overlongDescriptions.length === 0 && fitsBudget) {
      console.info(
        `All ${String(skillPaths.length)} authored skill descriptions hold at most ${String(MAXIMUM_DESCRIPTION_WORDS)} words, ${String(totalCharacters)} of ${String(MAXIMUM_TOTAL_DESCRIPTION_CHARACTERS)} characters together.`,
      );

      return true;
    }

    if (overlongDescriptions.length > 0) {
      console.error(
        `These skill descriptions hold more than ${String(MAXIMUM_DESCRIPTION_WORDS)} words:`,
      );

      for (const { skillPath, words } of overlongDescriptions) {
        console.error(`- ${skillPath} (${String(words)} words)`);
      }
    }

    if (!fitsBudget) {
      console.error(
        `The authored skill descriptions hold ${String(totalCharacters)} characters together, over the ${String(MAXIMUM_TOTAL_DESCRIPTION_CHARACTERS)} the listing budget allows.`,
      );
    }

    return false;
  }
}
