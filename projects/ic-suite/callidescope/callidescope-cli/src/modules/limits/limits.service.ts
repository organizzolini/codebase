import path from "node:path";

import { ConfigurationService } from "@callidescope/configuration";
import { FileFilterService, WorkspaceService } from "@callidescope/graph";
import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import type {
  LimitName,
  LimitsCommandOptions,
  ProjectLimitRow,
} from "./limits.types";
import type {
  ProjectLimits,
  ResolvedCallidescopeConfiguration,
} from "@callidescope/configuration";

/**
 * Says what every project in a workspace is gated by, without tracing it.
 *
 * Reads configuration only. The numbers come from `ConfigurationService.resolveLimits`,
 * the same resolver a gated run reads, so a listing cannot disagree with the gate.
 */
@Injectable()
export class LimitsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly fileFilterService: FileFilterService,
    private readonly workspaceService: WorkspaceService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LimitsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Finds the workspace's projects, using the run's filter rather than any project's.
   * A fully excluded project still lists its limits.
   */
  private discoverProjects(args: {
    configuration: ResolvedCallidescopeConfiguration;
    workspaceRoot: string;
  }): string[] {
    const fileFilter = this.fileFilterService.buildFileFilter({
      exclude: args.configuration.exclude,
      excludeFrom: args.configuration.excludeFrom,
      workspaceRoot: args.workspaceRoot,
    });

    return this.workspaceService
      .discoverProjects({
        directories: args.configuration.directories,
        fileFilter,
        workspaceRoot: args.workspaceRoot,
      })
      .map((project) => project.name);
  }

  /** Builds the two rows one project resolves to, depth first. */
  private toProjectRows(args: {
    limits: ProjectLimits;
    project: string;
    workspaceRoot: string;
  }): ProjectLimitRow[] {
    return [
      this.toRow({ ...args, limit: "maximumDepth" }),
      this.toRow({ ...args, limit: "maximumBreadth" }),
    ];
  }

  /**
   * Reads one resolved limit into its row, naming the file only when a file wrote the number.
   */
  private toRow(args: {
    limit: LimitName;
    limits: ProjectLimits;
    project: string | undefined;
    workspaceRoot: string;
  }): ProjectLimitRow {
    const value = args.limits[args.limit];

    return {
      limit: args.limit,
      path:
        args.limits.path === undefined || value === undefined
          ? undefined
          : path.relative(args.workspaceRoot, args.limits.path),
      project: args.project,
      value,
    };
  }

  /** Builds the two rows for the defaults every project's file spreads. */
  private toWorkspaceRows(args: {
    limits: ProjectLimits;
    workspaceRoot: string;
  }): ProjectLimitRow[] {
    return [
      this.toRow({ ...args, limit: "maximumDepth", project: undefined }),
      this.toRow({ ...args, limit: "maximumBreadth", project: undefined }),
    ];
  }

  // 🌎 Public Methods

  /**
   * Resolves every project's limits, workspace default first. Writes and gates nothing;
   * a refused project config still ends the run.
   */
  public async list(options: LimitsCommandOptions): Promise<ProjectLimitRow[]> {
    const workspaceRoot = process.cwd();
    // The file-aware load, with `authored` alongside the resolved object: the listing names
    // the file each number was written in, so it must know which file is the workspace's own
    // and which numbers that file wrote.
    const {
      authored,
      configuration,
      path: configurationPath,
    } = await this.configurationService.loadConfigurationFile({
      configurationPath: options.config,
    });
    const projects = this.discoverProjects({ configuration, workspaceRoot });
    const projectConfigurations =
      await this.configurationService.loadProjectConfigurations({
        projects,
        workspaceConfigurationPath: configurationPath,
        workspaceRoot,
      });
    const limits = this.configurationService.resolveLimits({
      projectConfigurations,
      projects,
      workspaceAuthoredLimits: authored.limits,
      workspaceConfiguration: configuration,
      workspaceConfigurationPath: configurationPath,
    });

    this.logger.info("🔭 Listed every project's limits", undefined, {
      declaringProjectCount: projectConfigurations.length,
      projectCount: projects.length,
    });

    return [
      ...this.toWorkspaceRows({ limits: limits.workspace, workspaceRoot }),
      ...[...limits.byProject].flatMap(([project, projectLimits]) =>
        this.toProjectRows({ limits: projectLimits, project, workspaceRoot }),
      ),
    ];
  }
}
