import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  NON_PROJECT_ROOT_DIRECTORIES,
  ROOT_README_PATH,
  TEMPLATE_PLACEHOLDER_PATTERN,
  WORKSPACE_SCOPES,
} from "./readme-projects.constants";

/**
 * Finds every workspace project and says which ones the root README does not
 * link to.
 *
 * A project is any directory with its own `package.json` directly in the
 * workspace root, or under `projects/` at any depth below its grouping
 * folders — the same definition the catalog policy scans by. Documented means the README links to that project's
 * directory somewhere as `[name](scope/name)`; nothing enforces the
 * surrounding prose, grouping, or description.
 */
@Injectable()
export class ReadmeProjectsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Every project path nested under `directoryPath`, at any depth. A
   * directory with its own `package.json` is a project and is not descended
   * into further; a directory without one is a grouping folder and is
   * searched recursively. A directory named for a template placeholder is
   * neither: the manifest inside it belongs to a project that does not exist.
   */
  private findProjectPaths(
    workspaceRoot: string,
    directoryPath: string,
  ): string[] {
    const projectPaths: string[] = [];

    for (const child of readdirSync(directoryPath, { withFileTypes: true })) {
      if (
        !child.isDirectory() ||
        TEMPLATE_PLACEHOLDER_PATTERN.test(child.name)
      ) {
        continue;
      }

      const childPath = path.join(directoryPath, child.name);
      const manifestPath = path.join(childPath, "package.json");

      if (existsSync(manifestPath)) {
        projectPaths.push(path.relative(workspaceRoot, childPath));
        continue;
      }

      projectPaths.push(...this.findProjectPaths(workspaceRoot, childPath));
    }

    return projectPaths;
  }

  /**
   * Every project that sits directly in the workspace root, such as
   * `validation`: a non-hidden directory with its own `package.json`. Not
   * searched any deeper, because the root also holds folders that are not
   * projects.
   */
  private findRootProjectPaths(workspaceRoot: string): string[] {
    const projectPaths: string[] = [];

    for (const child of readdirSync(workspaceRoot, { withFileTypes: true })) {
      if (
        !child.isDirectory() ||
        child.name.startsWith(".") ||
        NON_PROJECT_ROOT_DIRECTORIES.includes(child.name) ||
        TEMPLATE_PLACEHOLDER_PATTERN.test(child.name)
      ) {
        continue;
      }

      if (existsSync(path.join(workspaceRoot, child.name, "package.json"))) {
        projectPaths.push(child.name);
      }
    }

    return projectPaths;
  }

  /** Every project path the README does not link to. */
  public findUndocumentedProjectPaths(
    projectPaths: string[],
    readmeContents: string,
  ): string[] {
    return projectPaths.filter(
      (projectPath) => !readmeContents.includes(`](${projectPath})`),
    );
  }

  /** Reads the root README's contents. */
  public readRootReadme(workspaceRoot: string): string {
    return readFileSync(path.join(workspaceRoot, ROOT_README_PATH), "utf8");
  }

  /** Every workspace project's scope-relative path, e.g. `projects/common/observability`. */
  public resolveWorkspaceProjectPaths(workspaceRoot: string): string[] {
    const projectPaths = this.findRootProjectPaths(workspaceRoot);

    for (const scope of WORKSPACE_SCOPES) {
      const scopePath = path.join(workspaceRoot, scope);

      if (!existsSync(scopePath)) {
        continue;
      }

      projectPaths.push(...this.findProjectPaths(workspaceRoot, scopePath));
    }

    return projectPaths;
  }
}
