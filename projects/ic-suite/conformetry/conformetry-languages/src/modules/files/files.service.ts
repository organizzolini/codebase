import fs from "node:fs";
import path from "node:path";

import { ConfigurationService } from "@conformetry/configuration";
import { Injectable } from "@nestjs/common";

import { DifferencesService } from "../differences/differences.service";

import type {
  CheckInstanceFilesArguments,
  FilesCheckResult,
  WeighedConformetryDifference,
} from "./files.types";
import type { InstanceFile } from "@conformetry/configuration";
import type { ValidationFileResult } from "@conformetry/core";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Checks that every file a project's template declares actually exists.
 *
 * Runs before any language validator, and is the only check covering every
 * template file regardless of extension. Validators only see their own
 * extensions, so `.gitignore` and `pyproject.toml` went unchecked.
 */
@Injectable()
/* v8 ignore stop */
export class FilesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly errorsService: DifferencesService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Reports an absent directory once, and a missing file otherwise.
   *
   * Reporting each file inside an absent directory would repeat the same finding.
   */
  private buildMissingDifference(args: {
    expectedFileCount: number;
    instanceFilePath: string;
    templateFilePath: string;
  }): WeighedConformetryDifference {
    const parentDirectoryPath = path.dirname(args.instanceFilePath);

    if (fs.existsSync(parentDirectoryPath)) {
      return {
        ...this.errorsService.buildMissingFileDifference(args),
        weight: 1,
      };
    }

    return {
      ...this.errorsService.buildMissingDirectoryDifference({
        instanceDirectoryPath: parentDirectoryPath,
        templateDirectoryPath: path.dirname(args.templateFilePath),
      }),
      // One finding stands in for every file the absent directory should have
      // held, so it costs what reporting them individually would have.
      weight: args.expectedFileCount,
    };
  }

  /** Counts how many declared files one directory should hold. */
  private countExpectedFiles(args: {
    expectedFiles: InstanceFile[];
    parentDirectoryPath: string;
  }): number {
    return args.expectedFiles.filter((expectedFile) => {
      return (
        path.dirname(expectedFile.instanceFilePath) === args.parentDirectoryPath
      );
    }).length;
  }

  /**
   * Reports every file a matched instance's template requires but the instance lacks.
   *
   * Collapses a missing directory to one finding.
   */
  public checkInstanceFiles(
    args: CheckInstanceFilesArguments,
  ): FilesCheckResult {
    const expectedFiles = this.configurationService.resolveInstanceFiles(
      args.instances,
    );
    const reportedDirectories = new Set<string>();
    const fileResults: ValidationFileResult[] = [];

    for (const expectedFile of expectedFiles) {
      if (fs.existsSync(expectedFile.instanceFilePath)) {
        continue;
      }

      const parentDirectoryPath = path.dirname(expectedFile.instanceFilePath);

      if (reportedDirectories.has(parentDirectoryPath)) {
        continue;
      }

      const error = this.buildMissingDifference({
        expectedFileCount: this.countExpectedFiles({
          expectedFiles,
          parentDirectoryPath,
        }),
        ...expectedFile,
      });

      if (error.differenceType === "directory") {
        reportedDirectories.add(parentDirectoryPath);
      }

      fileResults.push({
        differences: [error],
        filename: path.basename(expectedFile.instanceFilePath),
        instanceFilePath: expectedFile.instanceFilePath,
        templateFilePath: expectedFile.templateFilePath,
        totalWeight: error.weight,
      });
    }

    // Every declared file is one requirement, present ones included.
    return { fileResults, totalWeight: expectedFiles.length };
  }
}
