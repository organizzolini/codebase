import { createRequire } from "node:module";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import semanticRelease from "semantic-release";

import { describeError } from "../process-runner/process-runner.utilities";

import {
  aggregateFailureSchema,
  RELEASE_CONFIGURATION_PATH,
  RELEASE_ENVIRONMENT,
  releaseConfigurationSchema,
} from "./semantic-release.constants";

import type {
  ReleaseConfiguration,
  ReleaseOptions,
} from "./semantic-release.types";

/**
 * Runs semantic-release over the release configuration in the `configuration`
 * project, through its API. semantic-release 26 cannot be pointed at that file:
 * its command line has no path option, and a shareable configuration cannot set
 * `plugins`, because its defaults override them. API options do not.
 */
@Injectable()
export class SemanticReleaseService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  private readonly requireFromCurrentModule = createRequire(import.meta.url);

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Says what failed, listing each failure an aggregate gathers. */
  private describeFailure(error: unknown): string {
    const aggregate = aggregateFailureSchema.safeParse(error);

    return aggregate.success
      ? aggregate.data.errors
          .map((failure) => this.describeFailure(failure))
          .join("\n")
      : describeError(error);
  }

  /** Reads the release configuration under `cwd`, or throws why it cannot. */
  private loadConfiguration(cwd: string): ReleaseConfiguration {
    return releaseConfigurationSchema.parse(
      this.requireFromCurrentModule(
        path.join(cwd, RELEASE_CONFIGURATION_PATH),
      ) as unknown,
    );
  }

  // 🌎 Public Methods

  /**
   * Runs semantic-release over the release configuration, with Husky's hooks
   * off, and says whether it finished. A failure is printed, not thrown.
   */
  public async release(options: ReleaseOptions = {}): Promise<boolean> {
    const cwd = process.cwd();

    try {
      await semanticRelease(
        {
          ...this.loadConfiguration(cwd),
          dryRun: options.dryRun === true,
        },
        { cwd, env: { ...process.env, ...RELEASE_ENVIRONMENT } },
      );

      return true;
    } catch (error: unknown) {
      console.error(this.describeFailure(error));

      return false;
    }
  }
}
