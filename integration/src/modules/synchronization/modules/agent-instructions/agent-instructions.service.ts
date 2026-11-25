import {
  existsSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { ReadmeProjectsService } from "../readme-projects/readme-projects.service";

import {
  INSTRUCTIONS_FILE_NAME,
  LINK_FILE_NAME,
} from "./agent-instructions.constants";

import type { LinkOutcome } from "./agent-instructions.types";

/**
 * Finds the projects whose `AGENTS.md` has no `CLAUDE.md` pointing at it, and
 * creates the links.
 *
 * Claude Code loads `CLAUDE.md` files, not `AGENTS.md`, so a project's
 * instructions reach it only through the link.
 */
@Injectable()
export class AgentInstructionsService {
  // 🏗 Dependency Injection

  constructor(private readonly readmeProjectsService: ReadmeProjectsService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether the link file is a symlink to the instructions file. */
  private isLinked(linkPath: string): boolean {
    const status = lstatSync(linkPath, { throwIfNoEntry: false });

    return (
      status?.isSymbolicLink() === true &&
      readlinkSync(linkPath) === INSTRUCTIONS_FILE_NAME
    );
  }

  /** Whether the link file is a regular file or directory that a link would replace. */
  private isOccupied(linkPath: string): boolean {
    const status = lstatSync(linkPath, { throwIfNoEntry: false });

    return status !== undefined && !status.isSymbolicLink();
  }

  // 🌎 Public Methods

  /** Every project path whose `AGENTS.md` has no `CLAUDE.md` link beside it. */
  public findUnlinkedProjects(workspaceRoot: string): string[] {
    return this.readmeProjectsService
      .resolveWorkspaceProjectPaths(workspaceRoot)
      .filter(
        (projectPath) =>
          existsSync(
            path.join(workspaceRoot, projectPath, INSTRUCTIONS_FILE_NAME),
          ) &&
          !this.isLinked(path.join(workspaceRoot, projectPath, LINK_FILE_NAME)),
      );
  }

  /**
   * Links each project's `CLAUDE.md` to its `AGENTS.md`, replacing a wrong
   * symlink but never a real file.
   */
  public linkProjects(
    workspaceRoot: string,
    projectPaths: string[],
  ): LinkOutcome {
    const refused: string[] = [];

    for (const projectPath of projectPaths) {
      const linkPath = path.join(workspaceRoot, projectPath, LINK_FILE_NAME);

      if (this.isOccupied(linkPath)) {
        refused.push(projectPath);
        continue;
      }

      if (lstatSync(linkPath, { throwIfNoEntry: false }) !== undefined) {
        unlinkSync(linkPath);
      }

      symlinkSync(INSTRUCTIONS_FILE_NAME, linkPath);
    }

    return { refused };
  }
}
