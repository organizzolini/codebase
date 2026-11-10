import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  PROJECT_CONFIGURATION_NESTED_FIELD_NAMES,
  PROJECT_CONFIGURATION_PERMITTED_FIELD_NAMES,
  PROJECT_CONFIGURATION_REQUIRED_FIELDS,
  ProjectConfigurationError,
  ProjectConfigurationFieldNotPermittedError,
  ProjectConfigurationIncompleteError,
  ProjectConfigurationMissingError,
} from "./configuration.constants";

import type { ConfigurationFileReader } from "./configuration-file.types";
import type {
  CallidescopeConfiguration,
  CallidescopeLimitOverrides,
  LoadedProjectConfiguration,
  LoadProjectConfigurationsArguments,
  ProjectLimits,
  ProjectLimitsLookup,
  ResolveProjectLimitsArguments,
} from "./configuration.types";

/**
 * Resolves the configuration file sitting beside each traced project.
 *
 * Its own service rather than more of `ConfigurationFileService`, because the two
 * answer different questions: one loads the file a run was pointed at, and this
 * one asks which of a run's projects configure themselves. Every refusal a
 * project configuration can earn belongs here, where the project it names is
 * already in hand.
 */
@Injectable()
export class ProjectConfigurationService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Refuses a project configuration that leaves a field out. Checked against `authored`, since resolution fills every field in.
   */
  private assertComplete(
    loadedConfiguration: LoadedProjectConfiguration,
  ): void {
    const field = this.findMissingField(loadedConfiguration.authored);

    if (field === undefined) {
      return;
    }

    throw new ProjectConfigurationIncompleteError({
      field,
      project: loadedConfiguration.project,
    });
  }

  /**
   * Refuses a project configuration that sets a field only the workspace
   * configuration may set.
   */
  private assertNoForbiddenFields(
    loadedConfiguration: LoadedProjectConfiguration,
  ): void {
    const field = this.findForbiddenField(loadedConfiguration.authored);

    if (field === undefined) {
      return;
    }

    throw new ProjectConfigurationFieldNotPermittedError({
      field,
      project: loadedConfiguration.project,
    });
  }

  /**
   * Reads a project's own declared limits, with overrides applied. Both numbers come from that one file.
   */
  private buildProjectLimits(args: {
    overrides: CallidescopeLimitOverrides | undefined;
    projectConfiguration: LoadedProjectConfiguration;
  }): ProjectLimits {
    const { limits } = args.projectConfiguration.configuration;

    return {
      maximumBreadth: this.overrideLimit({
        declared: limits.maximumBreadth,
        override: args.overrides?.maximumBreadth,
      }),
      maximumDepth:
        this.overrideLimit({
          declared: limits.maximumDepth,
          override: args.overrides?.maximumDepth,
        }) ?? limits.maximumDepth,
      path: args.projectConfiguration.path,
    };
  }

  /**
   * Reads the limits the workspace file declares. The path is named only when that file wrote a limit.
   */
  private buildWorkspaceLimits(
    args: ResolveProjectLimitsArguments,
  ): ProjectLimits {
    // Already overridden: the run's own configuration is what the flags were
    // resolved against, so re-applying them here would be the second answer to
    // a number this service exists to give one answer to.
    const { maximumBreadth, maximumDepth } = args.workspaceConfiguration.limits;

    const authored = args.workspaceAuthoredLimits;
    const wroteALimit =
      authored?.maximumBreadth !== undefined ||
      authored?.maximumDepth !== undefined;

    return {
      maximumBreadth,
      maximumDepth,
      path: wroteALimit ? args.workspaceConfigurationPath : undefined,
    };
  }

  /**
   * Finds the first field a project sets that only the workspace may set. Fails closed: an unclassified field is refused by name.
   */
  private findForbiddenField(
    authored: CallidescopeConfiguration,
  ): string | undefined {
    // Widened before it is walked, because a field name read off a file is a
    // string and the interface has no index signature to read it through.
    const fields: Readonly<Record<string, unknown>> = { ...authored };

    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined) {
        continue;
      }

      const forbidden = PROJECT_CONFIGURATION_NESTED_FIELD_NAMES.has(field)
        ? this.findForbiddenMember({ field, value })
        : this.readForbiddenField(field);

      if (forbidden !== undefined) {
        return forbidden;
      }
    }

    return undefined;
  }

  /**
   * Finds the first member a project sets inside a field classified one member at a time, named as `write.json`.
   */
  private findForbiddenMember(args: {
    field: string;
    value: unknown;
  }): string | undefined {
    if (typeof args.value !== "object" || args.value === null) {
      return args.field;
    }

    // Widened the same way the field walk above is, and for the same reason: a
    // member name read off a file is a string, and `Object.entries` over a bare
    // `object` hands back values nothing has typed.
    const members: Readonly<Record<string, unknown>> = { ...args.value };

    for (const [member, memberValue] of Object.entries(members)) {
      const name = `${args.field}.${member}`;

      if (
        memberValue !== undefined &&
        !PROJECT_CONFIGURATION_PERMITTED_FIELD_NAMES.has(name)
      ) {
        return name;
      }
    }

    return undefined;
  }

  /**
   * Finds the first field a project's configuration leaves out. Presence is checked, not value, so `undefined` counts as set.
   */
  private findMissingField(
    authored: CallidescopeConfiguration,
  ): string | undefined {
    // Widened before it is walked, because the required names are strings and
    // the interface has no index signature to read them through.
    const fields: Readonly<Record<string, unknown>> = { ...authored };

    for (const [field, members] of Object.entries(
      PROJECT_CONFIGURATION_REQUIRED_FIELDS,
    )) {
      if (!(field in fields)) {
        return field;
      }

      const value = fields[field];

      if (members.length === 0) {
        continue;
      }

      if (typeof value !== "object" || value === null) {
        return field;
      }

      const missing = members.find((member) => !(member in value));

      if (missing !== undefined) {
        return `${field}.${missing}`;
      }
    }

    return undefined;
  }

  /**
   * Reads one project's configuration file. Rethrows any failure naming the project, since a bare parse error does not say which to fix.
   */
  private async loadProjectConfiguration(args: {
    configurationPath: string;
    project: string;
    reader: ConfigurationFileReader;
  }): Promise<LoadedProjectConfiguration> {
    try {
      const loaded = await args.reader.loadConfigurationFile({
        configurationPath: args.configurationPath,
      });

      return {
        authored: loaded.authored,
        configuration: loaded.configuration,
        // The path the loader settled on, never the one it was handed: a named
        // path is resolved before it is read, and the file that was read is the
        // one every later rule has to be talking about.
        path: loaded.path,
        project: args.project,
      };
    } catch (error) {
      throw new ProjectConfigurationError({
        cause: error,
        configurationPath: args.configurationPath,
        project: args.project,
      });
    }
  }

  /**
   * Applies one command-line limit override to one project's declared limit. A flag overrides a declared limit but never supplies one.
   */
  private overrideLimit(args: {
    declared: number | undefined;
    override: number | undefined;
  }): number | undefined {
    return args.declared === undefined
      ? undefined
      : (args.override ?? args.declared);
  }

  /** The name of a whole field a project may not set, or nothing when it may. */
  private readForbiddenField(field: string): string | undefined {
    return PROJECT_CONFIGURATION_PERMITTED_FIELD_NAMES.has(field)
      ? undefined
      : field;
  }

  // 🌎 Public Methods

  /**
   * Loads each traced project's own file, which must exist and be complete. The run's own file is skipped.
   */
  public async loadProjectConfigurations(
    args: LoadProjectConfigurationsArguments,
    reader: ConfigurationFileReader,
  ): Promise<LoadedProjectConfiguration[]> {
    const workspaceConfigurationPath = path.resolve(
      args.workspaceRoot,
      args.workspaceConfigurationPath,
    );

    const loaded: LoadedProjectConfiguration[] = [];

    for (const project of args.projects) {
      const configurationPath = reader.findConfigurationFileAt(
        path.resolve(args.workspaceRoot, project),
      );

      if (configurationPath === undefined) {
        throw new ProjectConfigurationMissingError(project);
      }

      if (configurationPath === workspaceConfigurationPath) {
        continue;
      }

      const projectConfiguration = await this.loadProjectConfiguration({
        configurationPath,
        project,
        reader,
      });
      this.assertNoForbiddenFields(projectConfiguration);
      this.assertComplete(projectConfiguration);
      loaded.push(projectConfiguration);
    }

    return loaded;
  }

  /**
   * Resolves each traced project's depth and breadth limits. One resolver, so a gate and a listing cannot disagree.
   */
  public resolveLimits(
    args: ResolveProjectLimitsArguments,
  ): ProjectLimitsLookup {
    const workspace = this.buildWorkspaceLimits(args);
    const limitsByProject = new Map(
      args.projectConfigurations.map((projectConfiguration) => [
        projectConfiguration.project,
        this.buildProjectLimits({
          overrides: args.limitOverrides,
          projectConfiguration,
        }),
      ]),
    );

    return {
      byProject: new Map(
        args.projects.map((project) => [
          project,
          limitsByProject.get(project) ?? workspace,
        ]),
      ),
      workspace,
    };
  }
}
