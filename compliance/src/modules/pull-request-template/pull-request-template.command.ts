import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  SYNC_PULL_REQUEST_TEMPLATE_MARKER,
  SYNC_PULL_REQUEST_TEMPLATE_TARGET_FILES,
} from "./pull-request-template.constants";

import type { PullRequestTemplateMode } from "./pull-request-template.types";

/**
 * CLI command that syncs the PR template from .github/PULL_REQUEST_TEMPLATE.md
 * into target skill files between marker comments. Runs in check or write mode.
 */
@Command({
  description: "Run the pull-request-template command",
  name: "pull-request-template",
})
@Injectable()
export class PullRequestTemplateCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(PullRequestTemplateCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Checks whether the target file's marker block matches the current PR template.
   */
  private checkTargetSync(
    templateContent: string,
    targetFile: string,
  ): boolean {
    const workspaceRoot = process.cwd();
    const targetName = path.relative(workspaceRoot, targetFile);
    const fileContent = readFileSync(targetFile, "utf8");
    const markerContent = this.extractMarkerContent(
      fileContent,
      SYNC_PULL_REQUEST_TEMPLATE_MARKER,
    );

    if (markerContent === undefined) {
      this.logger.info("📄 Missing markers", undefined, {
        marker: SYNC_PULL_REQUEST_TEMPLATE_MARKER,
        target: targetName,
      });
      return false;
    }

    const expectedCodeBlock = this.wrapInCodeBlock(templateContent);

    if (markerContent.trim() !== expectedCodeBlock.trim()) {
      this.logger.info("📄 Detected an out-of-sync PR template", undefined, {
        target: targetName,
      });
      return false;
    }

    return true;
  }

  /**
   * Extracts the content between start and end marker comments from a file.
   */
  private extractMarkerContent(
    content: string,
    markerName: string,
  ): string | undefined {
    const pattern = new RegExp(
      String.raw`<!-- ${markerName}-start -->\n([\s\S]*?)<!-- ${markerName}-end -->`,
    );
    const match = pattern.exec(content);
    return match?.[1];
  }

  /**
   * Checks all target files for sync and reports whether every one matched.
   */
  private handleCheckMode(
    templateContent: string,
    targetFiles: string[],
  ): boolean {
    let allInSync = true;
    for (const targetFile of targetFiles) {
      if (!this.checkTargetSync(templateContent, targetFile)) {
        allInSync = false;
      }
    }
    if (!allInSync) {
      this.logger.info("💡 Suggested a fix", undefined, {
        hint: "Run 'nx run compliance:pull-request-template:write' to sync",
      });
      return false;
    }
    this.logger.info("📄 Verified the PR template");
    return true;
  }

  /**
   * Writes the current PR template into any target files that are out of sync.
   */
  private handleWriteMode(
    templateContent: string,
    targetFiles: string[],
  ): void {
    const outOfSyncTargets = targetFiles.filter(
      (targetFile) => !this.checkTargetSync(templateContent, targetFile),
    );
    if (outOfSyncTargets.length === 0) {
      this.logger.info("📄 Verified every PR template was already in sync");
    } else {
      for (const targetFile of outOfSyncTargets) {
        this.writeTargetSync(templateContent, targetFile);
      }
    }
  }

  /**
   * Reads and trims the PR template from the given file path.
   */
  private loadTemplate(templateFile: string): string {
    return readFileSync(templateFile, "utf8").trimEnd();
  }

  /**
   * Replaces the content between start and end marker comments with new content.
   */
  private replaceMarkerContent(
    content: string,
    markerName: string,
    newContent: string,
  ): string {
    const pattern = new RegExp(
      String.raw`(<!-- ${markerName}-start -->\n)[\s\S]*?(<!-- ${markerName}-end -->)`,
    );
    return content.replace(pattern, `$1\n${newContent}\n\n$2`);
  }

  /** Resolves the mode argument, defaulting to check, or exits on an unknown one. */
  private resolveMode(passedParameters: string[]): PullRequestTemplateMode {
    const modeValue = passedParameters[0] ?? "check";

    if (modeValue === "check" || modeValue === "write") {
      return modeValue;
    }

    this.logger.error("🚦 Rejected an unusable mode", undefined, {
      mode: modeValue,
      reason: "Invalid mode",
      usage:
        "💡 Usage: nx run compliance:pull-request-template:check (or compliance:pull-request-template:write)",
    });
    return process.exit(1);
  }

  /** Synchronizes the PR template and reports success without exiting. */
  private async synchronize(mode: PullRequestTemplateMode): Promise<boolean> {
    try {
      await Promise.resolve();
      const workspaceRoot = process.cwd();
      const templateFile = path.join(
        workspaceRoot,
        ".github/PULL_REQUEST_TEMPLATE.md",
      );
      const targetFiles = SYNC_PULL_REQUEST_TEMPLATE_TARGET_FILES.map((f) =>
        path.join(workspaceRoot, f),
      );

      const templateContent = this.loadTemplate(templateFile);

      if (mode === "check") {
        return this.handleCheckMode(templateContent, targetFiles);
      }

      this.handleWriteMode(templateContent, targetFiles);
      return true;
    } catch (error) {
      this.logger.error(
        "💥 Failed synchronizing the PR template",
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Wraps content in a markdown code block tagged as markdown.
   */
  private wrapInCodeBlock(content: string): string {
    return `\`\`\`markdown\n${content}\n\`\`\``;
  }

  /**
   * Writes the PR template code block into a target file between its marker comments.
   */
  private writeTargetSync(templateContent: string, targetFile: string): void {
    const workspaceRoot = process.cwd();
    const targetName = path.relative(workspaceRoot, targetFile);
    this.logger.info("🔄 Syncing a PR template", undefined, {
      target: targetName,
    });

    const fileContent = readFileSync(targetFile, "utf8");
    const codeBlock = this.wrapInCodeBlock(templateContent);
    const updatedContent = this.replaceMarkerContent(
      fileContent,
      SYNC_PULL_REQUEST_TEMPLATE_MARKER,
      codeBlock,
    );

    writeFileSync(targetFile, updatedContent, "utf8");
    this.logger.info("📄 Synced the PR template", undefined, {
      target: targetName,
    });
  }

  // 🌎 Public Methods

  /**
   * Runs the pull-request-template sync command in check or write mode.
   */
  async run(
    passedParameters: string[],
    _options?: Record<string, unknown>,
  ): Promise<void> {
    const mode = this.resolveMode(passedParameters);

    if (!(await this.synchronize(mode))) {
      process.exit(1);
    }
  }
}
