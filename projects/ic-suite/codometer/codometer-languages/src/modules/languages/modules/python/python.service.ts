import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EMPTY_PYTHON_RESULT } from "./python.constants";

import type {
  AnalyzePythonArguments,
  AnalyzePythonContentsArguments,
  PythonResult,
} from "./python.types";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Executes the Python analysis script and returns aggregated metrics.
 */
@Injectable()
/* v8 ignore stop */
export class PythonService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(PythonService.name);
  }

  // 🔐 Private Fields

  private readonly scriptPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "python.service.py",
  );

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Analyzes Python files relative to the directory. The interpreter comes from configuration, since a managed environment needs `uv run python`.
   */
  analyze(args: AnalyzePythonArguments): PythonResult {
    if (args.pythonFiles.length === 0) {
      return { ...EMPTY_PYTHON_RESULT, commentTokens: [] };
    }

    try {
      const output = execSync(`${args.command} "${this.scriptPath}"`, {
        cwd: args.workingDirectory,
        encoding: "utf8",
        input: args.pythonFiles.join("\n"),
      });

      return JSON.parse(output.trim()) as PythonResult;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`🐍 Skipped Python analysis`, undefined, {
        reason: message,
      });
      return { ...EMPTY_PYTHON_RESULT, commentTokens: [] };
    }
  }

  /**
   * Analyzes Python source with no file of its own. Sources are staged in a temp directory, but run from the measured one.
   */
  analyzeContents(args: AnalyzePythonContentsArguments): PythonResult {
    if (args.contents.length === 0) {
      return { ...EMPTY_PYTHON_RESULT, commentTokens: [] };
    }

    const stagingDirectory = mkdtempSync(
      path.join(tmpdir(), "codometer-python-"),
    );

    try {
      const pythonFiles = args.contents.map((content, index) => {
        const stagedPath = path.join(stagingDirectory, `source-${index}.py`);
        writeFileSync(stagedPath, content, "utf8");
        return stagedPath;
      });

      return this.analyze({
        command: args.command,
        pythonFiles,
        workingDirectory: args.workingDirectory,
      });
    } finally {
      rmSync(stagingDirectory, { force: true, recursive: true });
    }
  }
}
