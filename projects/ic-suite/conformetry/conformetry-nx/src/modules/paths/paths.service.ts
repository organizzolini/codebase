import path from "node:path";

import {
  ConfigurationService,
  InputError,
  missingDirectoryError,
} from "@conformetry/configuration";
import { Injectable } from "@nestjs/common";
import { getProjects, readProjectConfiguration } from "@nx/devkit";

import { InstancesService } from "../instances/instances.service";
import { ScopeService } from "../scope/scope.service";

import {
  DIRECTORY_INPUT_NAME,
  MODULE_INPUT_NAME,
  PROJECT_INPUT_NAME,
  TYPE_INPUT_NAME,
} from "./paths.constants";
import {
  matchesDirectoryPattern,
  staticDirectoryPrefix,
} from "./paths.utilities";

import type {
  AllowedDirectories,
  ResolveGenerationPathArguments,
} from "./paths.types";
import type { Instance } from "@conformetry/configuration";
import type { Tree } from "@nx/devkit";

/**
 * Decides where a generator writes, by reading the workspace it writes into.
 *
 * Layout is inferred from the projects and module folders that already exist, rather than from a configured convention that could go stale.
 */
@Injectable()
export class PathsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly instancesService: InstancesService,
    private readonly configurationService: ConfigurationService,
    private readonly scopeService: ScopeService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Refuses a destination the generator's instances are not found in. */
  private assertDirectoryAllowed(args: {
    allowedDirectories: AllowedDirectories | undefined;
    directory: string;
    generatorName: string | undefined;
    workspaceRoot: string;
  }): void {
    if (args.allowedDirectories?.enforced !== true) {
      return;
    }

    const relativeDirectory = path
      .relative(args.workspaceRoot, args.directory)
      .split(path.sep)
      .join("/");

    if (
      args.allowedDirectories.patterns.some((pattern) => {
        return matchesDirectoryPattern({
          directory: relativeDirectory,
          pattern,
        });
      })
    ) {
      return;
    }

    throw new InputError(
      `Generator ${args.generatorName} cannot generate into ${relativeDirectory === "" ? "the workspace root" : relativeDirectory}. Allowed directories: ${args.allowedDirectories.patterns.join(", ")}.`,
    );
  }

  /**
   * Locates a named module, refusing one the project does not have.
   *
   * A made-up path would scatter stray directories.
   */
  private requireModulePath(args: {
    instances: Instance[];
    moduleName: string;
    projectName: string;
  }): string {
    const modulePath = this.resolveModulePath({
      instances: args.instances,
      moduleName: args.moduleName,
    });

    if (modulePath === undefined) {
      throw new Error(
        `Project ${args.projectName} has no module named ${args.moduleName}. Generate the module first, or name one of its existing modules.`,
      );
    }

    return modulePath;
  }

  /**
   * The directories a generator's untagged instance globs point into.
   *
   * Each glob's parent is where new instances may go.
   */
  private async resolveAllowedDirectories(args: {
    configurationPath: string;
    generatorName: string | undefined;
  }): Promise<AllowedDirectories | undefined> {
    if (args.generatorName === undefined) {
      return undefined;
    }

    const configuration =
      await this.configurationService.loadConformetryConfiguration(
        args.configurationPath,
      );
    const patterns = (
      configuration.find((generator) => {
        return generator.name === args.generatorName;
      })?.instances ?? []
    )
      .filter((group) => !this.configurationService.isProjectScoped(group))
      .flatMap((group) => group.patterns ?? []);

    return patterns.length === 0
      ? undefined
      : {
          // A literal path names one known instance rather than a place new
          // ones may go, so only a glob turns the list into a restriction.
          enforced: patterns.some((pattern) => pattern.includes("*")),
          patterns: [
            ...new Set(patterns.map((pattern) => path.posix.dirname(pattern))),
          ],
        };
  }

  /** Resolves a caller-named destination, refusing one not allowed. */
  private resolveExplicitDirectory(args: {
    allowedDirectories: AllowedDirectories | undefined;
    explicitDirectory: string;
    generatorName: string | undefined;
    workspaceRoot: string;
  }): string {
    const directory = path.resolve(args.workspaceRoot, args.explicitDirectory);

    this.assertDirectoryAllowed({
      allowedDirectories: args.allowedDirectories,
      directory,
      generatorName: args.generatorName,
      workspaceRoot: args.workspaceRoot,
    });

    return directory;
  }

  /**
   * Infers where a project keeps its modules, from existing ones.
   *
   * The directory holding the most wins; no modules, no guess.
   */
  private resolveModuleParentPath(args: {
    instances: Instance[];
    projectRootPath: string;
  }): string | undefined {
    const countsByParent = new Map<string, number>();

    for (const instance of args.instances) {
      // An instance's path is already the parent: the template supplies the
      // folder, so nothing is stripped here.
      const parentPath = instance.path;

      if (!parentPath.startsWith(args.projectRootPath + path.sep)) {
        continue;
      }

      countsByParent.set(parentPath, (countsByParent.get(parentPath) ?? 0) + 1);
    }

    return [...countsByParent.entries()].toSorted(
      ([left, leftCount], [right, rightCount]) => {
        return rightCount - leftCount || left.localeCompare(right);
      },
    )[0]?.[0];
  }

  /**
   * Finds the directory holding an existing module of the given name.
   *
   * Used when a generator adds files to an existing module.
   */
  private resolveModulePath(args: {
    instances: Instance[];
    moduleName: string;
  }): string | undefined {
    const instance = args.instances.find((entry) => {
      return entry.nameStem === args.moduleName;
    });

    return instance === undefined
      ? undefined
      : path.join(instance.path, instance.nameStem);
  }

  /**
   * Places a new project by its type.
   *
   * Refuses without a type, rather than writing to the workspace root.
   */
  private resolveNewProjectPath(args: {
    allowedDirectories: AllowedDirectories | undefined;
    generatorName: string | undefined;
    tree: Tree;
    type: string | undefined;
    workspaceRoot: string;
  }): string {
    const [firstAllowed] = args.allowedDirectories?.patterns ?? [];

    if (args.type === undefined && firstAllowed !== undefined) {
      return path.resolve(
        args.workspaceRoot,
        staticDirectoryPrefix(firstAllowed),
      );
    }

    if (args.type === undefined) {
      throw missingDirectoryError({
        generatorName: args.generatorName,
        hint: "Or declare a type input on the generator, so the project is placed beside the others of its type.",
      });
    }

    const directory = path.resolve(
      args.workspaceRoot,
      this.resolveTypeDirectoryPath({ tree: args.tree, type: args.type }) ??
        args.type,
    );

    this.assertDirectoryAllowed({
      allowedDirectories: args.allowedDirectories,
      directory,
      generatorName: args.generatorName,
      workspaceRoot: args.workspaceRoot,
    });

    return directory;
  }

  /** Places an instance inside an existing project: scope first, then layout. */
  private async resolveProjectParentPath(args: {
    configurationPath: string;
    generatorName: string | undefined;
    instances: Instance[];
    projectRootPath: string;
  }): Promise<string> {
    const scopedDirectory = await this.resolveScopedDirectory({
      configurationPath: args.configurationPath,
      generatorName: args.generatorName,
    });

    if (scopedDirectory !== undefined) {
      return path.join(args.projectRootPath, scopedDirectory);
    }

    return (
      this.resolveModuleParentPath({
        instances: args.instances,
        projectRootPath: args.projectRootPath,
      }) ?? args.projectRootPath
    );
  }

  /**
   * The folder a generator's scope places new instances in, if it names one.
   *
   * Preferred over inference, since the scope states where instances belong.
   */
  private async resolveScopedDirectory(args: {
    configurationPath: string;
    generatorName: string | undefined;
  }): Promise<string | undefined> {
    if (args.generatorName === undefined) {
      return undefined;
    }

    const configuration =
      await this.configurationService.loadConformetryConfiguration(
        args.configurationPath,
      );
    const definition = configuration.find((generator) => {
      return generator.name === args.generatorName;
    });

    return definition === undefined
      ? undefined
      : this.scopeService.resolveScopedDirectory(definition.instances);
  }

  /**
   * Finds the workspace directory where projects of a type already live.
   *
   * `type: "packages"` resolves to wherever packages live.
   */
  private resolveTypeDirectoryPath(args: {
    tree: Tree;
    type: string;
  }): string | undefined {
    for (const [, configuration] of getProjects(args.tree)) {
      const [firstSegment] = configuration.root.split("/");

      if (firstSegment === args.type) {
        return firstSegment;
      }
    }

    return undefined;
  }

  // 🌎 Public Methods

  /**
   * Resolves the directory a generator's template tree is laid over.
   *
   * Throws for a new project given neither directory nor type.
   */
  public async resolveGenerationPath(
    args: ResolveGenerationPathArguments,
  ): Promise<string> {
    const allowedDirectories = await this.resolveAllowedDirectories({
      configurationPath: args.configurationPath,
      generatorName: args.generatorName,
    });
    const explicitDirectory = args.inputs[DIRECTORY_INPUT_NAME];

    if (explicitDirectory !== undefined) {
      return this.resolveExplicitDirectory({
        allowedDirectories,
        explicitDirectory,
        generatorName: args.generatorName,
        workspaceRoot: args.workspaceRoot,
      });
    }

    const projectName = args.inputs[PROJECT_INPUT_NAME];

    if (projectName === undefined) {
      return this.resolveNewProjectPath({
        allowedDirectories,
        generatorName: args.generatorName,
        tree: args.tree,
        type: args.inputs[TYPE_INPUT_NAME],
        workspaceRoot: args.workspaceRoot,
      });
    }

    const project = readProjectConfiguration(args.tree, projectName);
    const projectRootPath = path.resolve(args.workspaceRoot, project.root);
    const instances = await this.instancesService.findProjectInstances({
      configurationPath: args.configurationPath,
      project: {
        name: projectName,
        root: project.root,
        tags: project.tags ?? [],
      },
      workspaceRoot: args.workspaceRoot,
    });
    const moduleName = args.inputs[MODULE_INPUT_NAME];

    if (moduleName !== undefined) {
      return this.requireModulePath({
        instances,
        moduleName,
        projectName,
      });
    }

    return await this.resolveProjectParentPath({
      configurationPath: args.configurationPath,
      generatorName: args.generatorName,
      instances,
      projectRootPath,
    });
  }
}
