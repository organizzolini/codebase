import { existsSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import ts from "typescript";

import {
  TYPESCRIPT_PROJECT_CONFIG_FILE,
  TypescriptProjectConfigurationError,
} from "./typescript.constants";

import type {
  TypescriptProject,
  TypescriptProjectProgram,
} from "./typescript.types";

/**
 * Discovers the workspace's TypeScript projects and builds a `ts.Program` for each one.
 *
 * Any project with its own `tsconfig.json` is a candidate, since no Nx tag is read. The
 * compiler options come from that file, so module resolution matches `tsc`.
 */
@Injectable()
export class TypescriptProjectService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Reads one project's compiler options, following the `extends` chain. The file name is
   * passed so diagnostics point at the right file.
   */
  private parseConfiguration(project: TypescriptProject): ts.ParsedCommandLine {
    const sourceFile = ts.readJsonConfigFile(project.tsconfigPath, (fileName) =>
      ts.sys.readFile(fileName),
    );
    const parsed = ts.parseJsonSourceFileConfigFileContent(
      sourceFile,
      ts.sys,
      path.dirname(project.tsconfigPath),
      undefined,
      project.tsconfigPath,
    );

    if (parsed.errors.length > 0) {
      throw new TypescriptProjectConfigurationError({
        configurationPath: project.tsconfigPath,
        messages: parsed.errors.map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
        ),
      });
    }

    return parsed;
  }

  // 🌎 Public Methods

  /** Builds one project's program, keeping the host and options alongside it. */
  buildProgram(project: TypescriptProject): TypescriptProjectProgram {
    const parsed = this.parseConfiguration(project);
    const host = ts.createCompilerHost(parsed.options, true);
    const program = ts.createProgram({
      host,
      options: parsed.options,
      rootNames: parsed.fileNames,
    });

    return { host, options: parsed.options, program, project };
  }

  /** Describes a project by its directory and Nx project name. */
  describeProject(absoluteRoot: string, name: string): TypescriptProject {
    return {
      absoluteRoot,
      name,
      tsconfigPath: path.join(absoluteRoot, TYPESCRIPT_PROJECT_CONFIG_FILE),
    };
  }

  /**
   * Keeps Nx projects with their own `tsconfig.json`, in input order, which callers sort by name.
   */
  discoverProjects(
    projects: { absoluteRoot: string; name: string }[],
  ): TypescriptProject[] {
    return projects
      .filter((project) =>
        existsSync(
          path.join(project.absoluteRoot, TYPESCRIPT_PROJECT_CONFIG_FILE),
        ),
      )
      .map((project) =>
        this.describeProject(project.absoluteRoot, project.name),
      );
  }

  /** Resolves a path through symlinks, which is how pnpm workspaces link. */
  toRealPath(filePath: string): string {
    return ts.sys.realpath === undefined ? filePath : ts.sys.realpath(filePath);
  }
}
