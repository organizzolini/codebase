import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { ReadmeProjectsService } from "./readme-projects.service";

import type { SynchronizableCommand } from "../../synchronization.types";

/**
 * CLI command that checks the root README links to every workspace project, so
 * none ships invisible to readers.
 *
 * Exits 0 when every project is linked and 1 when any is not.
 */
@Command({
  description: "Check that the root README links to every workspace project",
  name: "readme-projects",
})
@Injectable()
export class ReadmeProjectsCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly readmeProjectsService: ReadmeProjectsService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ReadmeProjectsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly fixCommand =
    "add a row linking each missing project to the root README.md";

  readonly synchronizationLabel = "readme-projects";

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Checks every workspace project and exits 0 or 1 on the verdict. */
  public async run(): Promise<void> {
    if (!(await this.synchronize())) {
      process.exit(1);
    }
  }

  /** Checks every workspace project and reports whether all are linked. Never writes. */
  public async synchronize(): Promise<boolean> {
    // Nothing here is asynchronous; the contract's signature is.
    await Promise.resolve();

    const workspaceRoot = process.cwd();
    const projectPaths =
      this.readmeProjectsService.resolveWorkspaceProjectPaths(workspaceRoot);
    const readmeContents =
      this.readmeProjectsService.readRootReadme(workspaceRoot);
    const undocumentedProjectPaths =
      this.readmeProjectsService.findUndocumentedProjectPaths(
        projectPaths,
        readmeContents,
      );

    if (undocumentedProjectPaths.length === 0) {
      console.info(
        `Root README documents all ${String(projectPaths.length)} workspace projects.`,
      );

      return true;
    }

    console.error("Root README is missing these workspace projects:");

    for (const undocumentedProjectPath of undocumentedProjectPaths) {
      console.error(`- ${undocumentedProjectPath}`);
    }

    return false;
  }
}
