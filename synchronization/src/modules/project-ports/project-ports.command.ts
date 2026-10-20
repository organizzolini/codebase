import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SynchronizationService } from "../synchronization/synchronization.service";

import {
  MAXIMUM_FILE_BYTES,
  PORT_SOURCES,
  PROJECTS_DIRECTORY,
  SKIPPED_DIRECTORIES,
  SKIPPED_FILES,
} from "./project-ports.constants";
import { ProjectPortsService } from "./project-ports.service";

import type {
  SynchronizableCommand,
  SynchronizationMode,
} from "../synchronization/synchronization.types";
import type { PortProject } from "./project-ports.types";

/**
 * CLI command that makes the port of every `*-api` and `*-web` application the
 * one its name hashes to.
 *
 * A web application declares its port in `vite.config.mts` and an API in
 * `.env.default`. When that port is not the hashed one, `write` rewrites it on
 * every line that is about a port, in every file of the project's domain
 * folder — `projects/lexico` for `lexico-web`, since the web application's
 * default API address and the API's allowed origin name each other's port.
 * Two applications whose names hash to the same port fail the check, because
 * no rewrite can resolve that.
 */
@Command({
  description: "Run the project-ports command",
  name: "project-ports",
})
@Injectable()
export class ProjectPortsCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly projectPortsService: ProjectPortsService,
    private readonly synchronizationModeService: SynchronizationService,
  ) {
    super();
    this.logger.setContext(ProjectPortsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly synchronizationLabel = "project-ports";

  // 🔏 Private Methods

  /** Reads a project directory's Nx name and, if it is an application with a port, describes it. */
  private describeProject(
    root: string,
    directory: string,
  ): PortProject | undefined {
    const manifest = path.join(root, directory, "project.json");
    const { name } = JSON.parse(readFileSync(manifest, "utf8")) as {
      name?: string;
    };
    const source = PORT_SOURCES.find((candidate) =>
      name?.endsWith(candidate.suffix),
    );

    if (name === undefined || source === undefined) return undefined;

    return {
      directory,
      expectedPort: this.projectPortsService.textToPort(name),
      name,
      source,
    };
  }

  /** Every `*-api` and `*-web` project, whether directly under `projects` or in a domain folder. */
  private findPortProjects(root: string): PortProject[] {
    const top = readdirSync(path.join(root, PROJECTS_DIRECTORY), {
      withFileTypes: true,
    }).filter((entry) => entry.isDirectory());

    return top
      .flatMap((entry) => {
        const directory = path.join(PROJECTS_DIRECTORY, entry.name);

        return this.isProject(root, directory)
          ? [directory]
          : this.findProjectDirectories(root, directory);
      })
      .map((directory) => this.describeProject(root, directory))
      .filter((project) => project !== undefined);
  }

  /** The projects directly under a directory, which are those that hold a `project.json`. */
  private findProjectDirectories(root: string, directory: string): string[] {
    return readdirSync(path.join(root, directory), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(directory, entry.name))
      .filter((child) => this.isProject(root, child));
  }

  /** Whether a directory is an Nx project. */
  private isProject(root: string, directory: string): boolean {
    return readdirSync(path.join(root, directory)).includes("project.json");
  }

  /** Every text file a port may be rewritten in under a directory. */
  private listFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return SKIPPED_DIRECTORIES.has(entry.name)
          ? []
          : this.listFiles(entryPath);
      }

      const isText =
        entry.isFile() &&
        !SKIPPED_FILES.has(entry.name) &&
        statSync(entryPath).size <= MAXIMUM_FILE_BYTES;

      return isText ? [entryPath] : [];
    });
  }

  /** The port a project currently declares, or `undefined` when its source does not declare one. */
  private readCurrentPort(
    root: string,
    project: PortProject,
  ): number | undefined {
    const { filePath, pattern } = project.source;
    const content = readFileSync(
      path.join(root, project.directory, filePath),
      "utf8",
    );
    const match = pattern.exec(content);

    return match?.[1] === undefined ? undefined : Number(match[1]);
  }

  /** The folder a project's port is rewritten across: its domain folder, or itself when it has none. */
  private resolveScope(project: PortProject): string {
    const parent = path.dirname(project.directory);

    return parent === PROJECTS_DIRECTORY ? project.directory : parent;
  }

  /** Rewrites a project's old port across its scope and returns the files that changed. */
  private rewritePort(
    root: string,
    project: PortProject,
    currentPort: number,
  ): string[] {
    return this.listFiles(path.join(root, this.resolveScope(project))).filter(
      (file) => {
        const content = readFileSync(file, "utf8");
        const rewritten = this.projectPortsService.replacePort(
          content,
          currentPort,
          project.expectedPort,
        );

        if (rewritten === content) return false;

        writeFileSync(file, rewritten, "utf8");
        return true;
      },
    );
  }

  /** Brings one project's port into line, or reports how it differs, and says whether it was current. */
  private synchronizeProject(
    mode: SynchronizationMode,
    root: string,
    project: PortProject,
  ): boolean {
    const currentPort = this.readCurrentPort(root, project);

    if (currentPort === undefined) {
      this.logger.error(
        "🔌 Failed to find the port a project declares",
        undefined,
        {
          file: path.join(project.directory, project.source.filePath),
          project: project.name,
        },
      );
      return false;
    }

    if (currentPort === project.expectedPort) return true;

    if (mode === "check") {
      this.logger.info("🔌 Detected an out-of-sync port", undefined, {
        currentPort,
        expectedPort: project.expectedPort,
        hint: "Run: nx run synchronization:project-ports:write",
        project: project.name,
      });
      return false;
    }

    const files = this.rewritePort(root, project, currentPort).map((file) =>
      path.relative(root, file),
    );

    this.logger.info("🔌 Updated a project's port", undefined, {
      currentPort,
      expectedPort: project.expectedPort,
      files,
      project: project.name,
    });
    return true;
  }

  /** Whether no two projects hash to the same port, which no rewrite can resolve if they do. */
  private verifyDistinctPorts(projects: PortProject[]): boolean {
    const names = new Map<number, string[]>();

    for (const { expectedPort, name } of projects) {
      names.set(expectedPort, [...(names.get(expectedPort) ?? []), name]);
    }

    const collisions = [...names].filter(([, sharing]) => sharing.length > 1);

    for (const [port, projectNames] of collisions) {
      this.logger.error("🔌 Detected projects sharing a port", undefined, {
        hint: "Rename one of them: both names hash to the same port",
        port,
        projects: projectNames,
      });
    }

    return collisions.length === 0;
  }

  // 🌎 Public Methods

  /** Runs the project-ports sync command in check or write mode. */
  async run(
    passedParameters: string[],
    _options?: Record<string, unknown>,
  ): Promise<void> {
    const mode =
      this.synchronizationModeService.resolveSynchronizationModeOrExit({
        invalidModeLabel: "Invalid mode",
        loggerService: this.logger,
        passedParameters,
        usageMessage:
          "💡 Usage: nx run synchronization:project-ports:check (or synchronization:project-ports:write)",
      });

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }

  /** Synchronizes every application's port and reports success without exiting. */
  async synchronize(mode: SynchronizationMode): Promise<boolean> {
    try {
      await Promise.resolve();

      const root = process.cwd();
      const projects = this.findPortProjects(root);
      const results = [
        this.verifyDistinctPorts(projects),
        ...projects.map((project) =>
          this.synchronizeProject(mode, root, project),
        ),
      ];
      const inSync = results.every(Boolean);

      if (inSync) {
        this.logger.info(
          "🔌 Verified every application's port against its hashed name",
          undefined,
          { count: projects.length },
        );
      }

      return inSync;
    } catch (error) {
      this.logger.error(
        "💥 Failed synchronizing the project ports",
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
