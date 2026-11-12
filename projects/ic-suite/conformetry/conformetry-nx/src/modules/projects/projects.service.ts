import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  DEPENDENCIES_DIRECTORY_NAME,
  NX_IGNORE_FILENAME,
  PROJECT_CONFIGURATION_FILENAME,
} from "./projects.constants";

import type { ProjectScope } from "../instances/instances.types";
import type {
  ListProjectConfigurationFilesArguments,
  ReadProjectScopeArguments,
} from "./projects.types";

/**
 * Reads the workspace's projects straight from their `project.json` files.
 *
 * Not from the project graph, which some callers cannot build. Sharing one implementation keeps the emitted plugin byte-identical however it was produced.
 */
@Injectable()
export class ProjectsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Narrows an untrusted value to an array without widening it to `any`. */
  private isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * Walks a directory for `project.json` files.
   *
   * Skips hidden directories, where the emitted plugin lives, and dependencies.
   */
  private listProjectConfigurationFiles(
    args: ListProjectConfigurationFilesArguments,
  ): string[] {
    const filePaths: string[] = [];

    for (const entry of readdirSync(args.directoryPath, {
      withFileTypes: true,
    })) {
      const entryPath = path.join(args.directoryPath, entry.name);
      const relativePath = path
        .relative(args.workspaceRoot, entryPath)
        .split(path.sep)
        .join("/");

      if (entry.isFile() && entry.name === PROJECT_CONFIGURATION_FILENAME) {
        filePaths.push(relativePath);
        continue;
      }

      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== DEPENDENCIES_DIRECTORY_NAME &&
        !args.ignoredPaths.includes(relativePath)
      ) {
        filePaths.push(
          ...this.listProjectConfigurationFiles({
            directoryPath: entryPath,
            ignoredPaths: args.ignoredPaths,
            workspaceRoot: args.workspaceRoot,
          }),
        );
      }
    }

    return filePaths;
  }

  /**
   * Reads the paths `.nxignore` excludes from project discovery.
   *
   * Keeps the walk in step with Nx, so templates are not read as projects.
   */
  private readIgnoredPaths(workspaceRoot: string): string[] {
    const ignoreFilePath = path.resolve(workspaceRoot, NX_IGNORE_FILENAME);

    if (!existsSync(ignoreFilePath)) {
      return [];
    }

    return readFileSync(ignoreFilePath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#"));
  }

  // 🌎 Public Methods

  /**
   * Every project in the workspace, sorted by name.
   *
   * A stable order keeps derived output, such as schema choices, the same between runs.
   */
  public listWorkspaceProjects(workspaceRoot: string): ProjectScope[] {
    return this.listProjectConfigurationFiles({
      directoryPath: workspaceRoot,
      ignoredPaths: this.readIgnoredPaths(workspaceRoot),
      workspaceRoot,
    })
      .map((projectConfigurationFile) => {
        return this.readProjectScope({
          projectConfigurationFile,
          workspaceRoot,
        });
      })
      .toSorted((left, right) => left.name.localeCompare(right.name));
  }

  /** Reads one project's name, root, and tags from its `project.json`. */
  public readProjectScope(args: ReadProjectScopeArguments): ProjectScope {
    const root = path.dirname(args.projectConfigurationFile);
    const parsed: unknown = JSON.parse(
      readFileSync(
        path.resolve(args.workspaceRoot, args.projectConfigurationFile),
        "utf8",
      ),
    );
    const configuration: { name?: unknown; tags?: unknown } =
      typeof parsed === "object" && parsed !== null ? { ...parsed } : {};
    const tags = this.isUnknownArray(configuration.tags)
      ? configuration.tags
      : [];

    const projectName =
      typeof configuration.name === "string" ? configuration.name : root;
    const stringTags = tags.filter(
      (tag): tag is string => typeof tag === "string",
    );

    return {
      name: projectName,
      root,
      tags: [...stringTags, `name:${projectName}`],
    };
  }
}
