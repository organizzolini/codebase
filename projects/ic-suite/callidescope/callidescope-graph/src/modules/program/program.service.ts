import path from "node:path";

import { Injectable } from "@nestjs/common";
import ts from "typescript";

import { LoggerService } from "@codebase/observability";

import { WorkspaceService } from "../workspace/workspace.service";

import { CompilerHostService } from "./compiler-host.service";
import {
  DEPENDENCY_DIRECTORY_NAME,
  ProgramConfigurationError,
} from "./program.constants";

import type { WorkspaceProject } from "../workspace/workspace.types";
import type {
  BuildProgramsArguments,
  ProgramSet,
  ProjectProgram,
} from "./program.types";

/**
 * Turns each project's `tsconfig.json` into a program and a type checker.
 *
 * One program per project, not one merged program, is a correctness decision.
 * Projects disagree about `jsx`, `lib`, `types`, and `paths`; merging them changes
 * which globals exist and yields wrong call-graph edges.
 */
@Injectable()
export class ProgramService {
  // 🏗 Dependency Injection

  constructor(
    private readonly compilerHostService: CompilerHostService,
    private readonly logger: LoggerService,
    private readonly workspaceService: WorkspaceService,
  ) {
    this.logger.setContext(ProgramService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Assigns each file to the program whose project root contains it, by its location on disk.
   */
  private assignOwnership(args: {
    programs: readonly ProjectProgram[];
    workspaceRoot: string;
  }): Map<string, ProjectProgram> {
    // Resolved through `toRealPath` too, so it lines up with `filePath`
    // below, which every owned path already went through to reach — a
    // workspace reached through a symlink would otherwise turn every
    // relative path into a string of `../` that contains nothing.
    const workspaceRoot = this.toRealPath(args.workspaceRoot);
    const projects = args.programs.map(
      (projectProgram) => projectProgram.project,
    );
    const filePaths = new Set<string>();

    for (const projectProgram of args.programs) {
      for (const filePath of projectProgram.ownedFilePaths) {
        filePaths.add(filePath);
      }
    }

    const ownerByFilePath = new Map<string, ProjectProgram>();

    for (const filePath of filePaths) {
      const workspaceRelativePath = this.workspaceService.toWorkspaceRelative({
        absolutePath: filePath,
        workspaceRoot,
      });
      const owningProject = this.workspaceService.resolveOwningProject({
        projects,
        workspaceRelativePath,
      });
      const projectProgram = args.programs.find(
        (candidate) => candidate.project === owningProject,
      );

      if (projectProgram === undefined) {
        this.logger.warn(
          "🔭 Skipped a file no traced project contains",
          undefined,
          { workspaceRelativePath },
        );
        continue;
      }

      ownerByFilePath.set(filePath, projectProgram);
    }

    return ownerByFilePath;
  }

  /** Builds one project's program, checker, and owned-file set. */
  private buildProgram(args: {
    project: WorkspaceProject;
    workspaceRoot: string;
  }): ProjectProgram {
    const parsed = this.parseConfiguration(args.project);
    const host = this.compilerHostService.createHost({
      options: parsed.options,
      workspaceRoot: args.workspaceRoot,
    });
    const program = ts.createProgram({
      host,
      options: parsed.options,
      rootNames: parsed.fileNames,
    });

    return {
      checker: program.getTypeChecker(),
      ownedFilePaths: new Set(
        parsed.fileNames.map((fileName) => this.toRealPath(fileName)),
      ),
      program,
      project: args.project,
    };
  }

  /**
   * Reads and fully resolves one project's compiler options. The file name is passed
   * so `extends` resolves and diagnostics point at it.
   */
  private parseConfiguration(project: WorkspaceProject): ts.ParsedCommandLine {
    // Wrapped rather than passed bare: `ts.sys.readFile` detached from `ts.sys` breaks
    // any implementation that reads `this`. The source-file form, not `readConfigFile`,
    // because that returns `any` and would strip the types from the parsed configuration.
    const sourceFile = ts.readJsonConfigFile(
      project.configurationPath,
      (fileName) => ts.sys.readFile(fileName),
    );
    const parsed = ts.parseJsonSourceFileConfigFileContent(
      sourceFile,
      ts.sys,
      path.dirname(project.configurationPath),
      undefined,
      project.configurationPath,
    );

    if (parsed.errors.length > 0) {
      throw new ProgramConfigurationError({
        configurationPath: project.configurationPath,
        messages: parsed.errors.map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
        ),
      });
    }

    return parsed;
  }

  /**
   * Reports the workspace-relative paths one program pulled in, via `getSourceFiles()`,
   * dropping `node_modules` and resolving symlinks.
   */
  private readPulledInPaths(args: {
    program: ts.Program;
    workspaceRoot: string;
  }): string[] {
    const workspaceRoot = this.toRealPath(args.workspaceRoot);
    const pulledIn: string[] = [];

    for (const sourceFile of args.program.getSourceFiles()) {
      const workspaceRelativePath = this.workspaceService.toWorkspaceRelative({
        absolutePath: this.toRealPath(sourceFile.fileName),
        workspaceRoot,
      });
      const segments = workspaceRelativePath.split("/");

      if (
        segments[0] !== ".." &&
        !segments.includes(DEPENDENCY_DIRECTORY_NAME)
      ) {
        pulledIn.push(workspaceRelativePath);
      }
    }

    return pulledIn;
  }

  // 🌎 Public Methods

  /**
   * Builds a program for every project in the starting projects' dependency closure,
   * asking each once and keeping the programs built.
   */
  public buildPrograms(args: BuildProgramsArguments): ProgramSet {
    const built: ProjectProgram[] = [];

    // The traversal returns nothing, by design: the projects it reached are
    // exactly the ones it asked for files, so `built` is the only
    // representation of the closure there is and the count logged below
    // cannot describe anything other than what was really built.
    this.workspaceService.walkImportedProjectClosure({
      resolveProjectFiles: (project): readonly string[] => {
        this.logger.debug("🔭 Reading a project", undefined, {
          projectName: project.name,
        });

        const projectProgram = this.buildProgram({
          project,
          workspaceRoot: args.workspaceRoot,
        });

        built.push(projectProgram);

        return this.readPulledInPaths({
          program: projectProgram.program,
          workspaceRoot: args.workspaceRoot,
        });
      },
      startingProjects: args.startingProjects,
      workspaceProjects: args.workspaceProjects,
    });

    this.logger.debug("🔭 Resolved a dependency closure", undefined, {
      projectCount: built.length,
      startingProjectCount: args.startingProjects.length,
    });

    // Ordered by project name rather than by the order the closure happened to
    // reach them, so a report's per-project rows read the same whichever
    // starting root a run was pointed at.
    const programs = built.toSorted((first, second) =>
      first.project.name.localeCompare(second.project.name),
    );

    return {
      ownerByFilePath: this.assignOwnership({
        programs,
        workspaceRoot: args.workspaceRoot,
      }),
      programs,
    };
  }

  /** Resolves a path through symlinks, which is how pnpm workspaces link. */
  public toRealPath(filePath: string): string {
    return ts.sys.realpath === undefined ? filePath : ts.sys.realpath(filePath);
  }
}
