import { Injectable } from "@nestjs/common";

import { FINDING_KEY_SEPARATOR } from "./validation.constants";

import type { InstanceFileResults } from "./validation.types";
import type { MatchedInstance } from "@conformetry/configuration";
import type { ValidationFileResult } from "@conformetry/core";

/**
 * Collapses findings of overlapping instances into one report.
 *
 * A file is often matched by several instances. Reporting each would repeat one defect per template.
 */
@Injectable()
export class ValidationDeduplicationService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Orders two instances by template size, then template name.
   *
   * Smallest wins: the narrowest template to fix.
   */
  private compareInstances(
    left: MatchedInstance,
    right: MatchedInstance,
  ): number {
    if (left.template.filePaths.length !== right.template.filePaths.length) {
      return left.template.filePaths.length - right.template.filePaths.length;
    }

    return left.template.name.localeCompare(right.template.name);
  }

  /** Keys a finding by the instance and template file pair it came from. */
  private resolveFindingKey(fileResult: ValidationFileResult): string {
    return [fileResult.instanceFilePath, fileResult.templateFilePath].join(
      FINDING_KEY_SEPARATOR,
    );
  }

  /** Picks, for each instance file, the group whose template is smallest. */
  private selectOwners(
    groups: InstanceFileResults[],
  ): Map<string, MatchedInstance> {
    const owners = new Map<string, MatchedInstance>();

    for (const group of groups) {
      for (const fileResult of group.fileResults) {
        const owner = owners.get(fileResult.instanceFilePath);

        if (
          owner === undefined ||
          this.compareInstances(group.instance, owner) < 0
        ) {
          owners.set(fileResult.instanceFilePath, group.instance);
        }
      }
    }

    return owners;
  }

  // 🌎 Public Methods

  /**
   * One finding per instance file, from the smallest reporting template.
   *
   * A larger template's unique requirement may go unreported.
   */
  public deduplicate(groups: InstanceFileResults[]): ValidationFileResult[] {
    const owners = this.selectOwners(groups);
    const seenKeys = new Set<string>();

    return groups.flatMap((group) => {
      return group.fileResults.filter((fileResult) => {
        if (owners.get(fileResult.instanceFilePath) !== group.instance) {
          return false;
        }

        const key = this.resolveFindingKey(fileResult);

        if (seenKeys.has(key)) {
          return false;
        }

        seenKeys.add(key);

        return true;
      });
    });
  }
}
